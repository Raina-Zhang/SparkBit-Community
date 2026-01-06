import { paopaoLocalDB } from './LocalDB';

// Let's define simple interfaces based on mock data structure
export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  [key: string]: any;
}

export interface Post {
  id: number;
  user_id: number;
  contents: any[];
  [key: string]: any;
}

export const dbService = {
  async init() {
    await paopaoLocalDB.initMockData();
  },

  async getUser(id: number): Promise<User | undefined> {
    return paopaoLocalDB.get<User>('users', id);
  },

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return paopaoLocalDB.findByIndex<Post>('posts', 'user_id', userId);
  },

  async getAllPosts(): Promise<Post[]> {
    return paopaoLocalDB.getAll<Post>('posts');
  },

  async getAllTags(): Promise<any[]> {
    return paopaoLocalDB.getAll('tags');
  },
  
  async createPost(post: Post): Promise<IDBValidKey> {
    // Auto-increment ID simulation if needed, but for now assuming post has ID or DB handles it if we used autoIncrement (we didn't yet)
    // We defined keyPath: 'id' but not autoIncrement: true. 
    // To be robust, we should find max ID and increment.
    
    // For this demo, let's assume the caller provides a unique ID or we generate one.
    if (!post.id) {
       const posts = await this.getAllPosts();
       const maxId = posts.reduce((max, p) => Math.max(max, p.id), 0);
       post.id = maxId + 1;
    }
    return paopaoLocalDB.add('posts', post);
  },

  async backupDB(): Promise<string> {
    return paopaoLocalDB.backup();
  }
};
