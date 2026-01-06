import { MOCK_USERS, MOCK_TAGS, MOCK_POSTS } from '../mock/data';

export interface DBStoreConfig {
  name: string;
  keyPath: string;
  indexes?: { name: string; keyPath: string; unique?: boolean }[];
}

export interface DBConfig {
  dbName: string;
  version: number;
  stores: DBStoreConfig[];
}

export class LocalDB {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;
  private config: DBConfig;

  constructor(config: DBConfig) {
    this.dbName = config.dbName;
    this.version = config.version;
    this.config = config;
  }

  public async connect(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => {
        console.error('LocalDB connection error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('LocalDB connected successfully');
        resolve(this.db!);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        this.config.stores.forEach((storeConfig) => {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath });
            storeConfig.indexes?.forEach((index) => {
              store.createIndex(index.name, index.keyPath, { unique: index.unique || false });
            });
            console.log(`Created store: ${storeConfig.name}`);
          }
        });
      };
    });
  }

  public async initMockData(): Promise<void> {
    await this.connect();
    
    // Check if data exists, if not, import
    const usersCount = await this.count('users');
    if (usersCount === 0) {
      console.log('Initializing mock data...');
      await this.bulkAdd('users', MOCK_USERS);
      await this.bulkAdd('tags', MOCK_TAGS);
      await this.bulkAdd('posts', MOCK_POSTS);
      console.log('Mock data initialized.');
    } else {
      console.log('Mock data already exists, skipping initialization.');
    }
  }

  private async getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    await this.connect();
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // --- CRUD Operations ---

  private async measure<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.log(`[LocalDB] ${operation} took ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`[LocalDB] ${operation} failed after ${(end - start).toFixed(2)}ms`, error);
      throw error;
    }
  }

  public async add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return this.measure(`add(${storeName})`, async () => {
        // Basic validation: ensure data is an object
        if (typeof data !== 'object' || data === null) {
        throw new Error('Data must be a valid object');
        }

        const store = await this.getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
        const request = store.add(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        });
    });
  }

  public async bulkAdd<T>(storeName: string, items: T[]): Promise<void> {
    return this.measure(`bulkAdd(${storeName}, count=${items.length})`, async () => {
        const store = await this.getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
        const transaction = store.transaction;
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);

        items.forEach(item => store.add(item));
        });
    });
  }

  public async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return this.measure(`get(${storeName}, ${key})`, async () => {
        const store = await this.getStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        });
    });
  }

  public async getAll<T>(storeName: string): Promise<T[]> {
    return this.measure(`getAll(${storeName})`, async () => {
        const store = await this.getStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        });
    });
  }

  public async update<T>(storeName: string, data: T): Promise<IDBValidKey> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async delete(storeName: string, key: IDBValidKey): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async count(storeName: string): Promise<number> {
    const store = await this.getStore(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Querying ---

  public async findByIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T[]> {
    const store = await this.getStore(storeName, 'readonly');
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Reliability & Maintenance ---

  public async backup(): Promise<string> {
    const backupData: Record<string, any[]> = {};
    for (const storeConfig of this.config.stores) {
      backupData[storeConfig.name] = await this.getAll(storeConfig.name);
    }
    return JSON.stringify(backupData);
  }

  public async restore(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    for (const storeName of Object.keys(data)) {
      await this.clear(storeName);
      await this.bulkAdd(storeName, data[storeName]);
    }
  }

  public async clear(storeName: string): Promise<void> {
     const store = await this.getStore(storeName, 'readwrite');
     return new Promise((resolve, reject) => {
       const request = store.clear();
       request.onsuccess = () => resolve();
       request.onerror = () => reject(request.error);
     });
  }
}

// Singleton instance configuration
export const paopaoLocalDB = new LocalDB({
  dbName: 'PaoPaoLocalDB',
  version: 1,
  stores: [
    {
      name: 'users',
      keyPath: 'id',
      indexes: [
        { name: 'username', keyPath: 'username', unique: true }
      ]
    },
    {
      name: 'posts',
      keyPath: 'id',
      indexes: [
        { name: 'user_id', keyPath: 'user_id', unique: false }
      ]
    },
    {
      name: 'tags',
      keyPath: 'id',
      indexes: [
        { name: 'user_id', keyPath: 'user_id', unique: false },
        { name: 'tag', keyPath: 'tag', unique: false }
      ]
    }
  ]
});
