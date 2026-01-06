<template>
  <div class="local-db-test">
    <h1>Local DB Test Suite</h1>
    
    <div class="card">
      <h2>1. Initialization</h2>
      <button @click="reInitDB">Re-initialize Mock Data</button>
      <div v-if="initStatus" class="status">{{ initStatus }}</div>
    </div>

    <div class="card">
      <h2>2. Data Retrieval</h2>
      <button @click="getUser">Get User 888</button>
      <button @click="getPosts">Get Posts for User 888</button>
      <button @click="getAllPosts">Get All Posts</button>
      
      <div v-if="retrievalResult" class="result">
        <pre>{{ retrievalResult }}</pre>
      </div>
    </div>

    <div class="card">
      <h2>3. Data Creation</h2>
      <button @click="createPost">Create New Post</button>
      <div v-if="createStatus" class="status">{{ createStatus }}</div>
    </div>

    <div class="card">
      <h2>4. Reliability (Backup/Restore)</h2>
      <button @click="backupDB">Backup DB</button>
      <button @click="clearDB">Clear DB (Simulate Loss)</button>
      <button @click="restoreDB" :disabled="!backupData">Restore DB</button>
      <div v-if="backupStatus" class="status">{{ backupStatus }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { dbService } from '../services/dbService';
import { paopaoLocalDB } from '../services/LocalDB';

const initStatus = ref('');
const retrievalResult = ref('');
const createStatus = ref('');
const backupStatus = ref('');
const backupData = ref('');

const reInitDB = async () => {
  try {
    initStatus.value = 'Initializing...';
    // Force clear and init
    await paopaoLocalDB.clear('users');
    await paopaoLocalDB.clear('posts');
    await paopaoLocalDB.clear('tags');
    await dbService.init();
    initStatus.value = 'Success: DB re-initialized with mock data.';
  } catch (err) {
    initStatus.value = 'Error: ' + err;
  }
};

const getUser = async () => {
  try {
    const user = await dbService.getUser(888);
    retrievalResult.value = JSON.stringify(user, null, 2);
  } catch (err) {
    retrievalResult.value = 'Error: ' + err;
  }
};

const getPosts = async () => {
  try {
    const posts = await dbService.getPostsByUserId(888);
    retrievalResult.value = `Found ${posts.length} posts for user 888.\n` + JSON.stringify(posts.slice(0, 2), null, 2) + '...';
  } catch (err) {
    retrievalResult.value = 'Error: ' + err;
  }
};

const getAllPosts = async () => {
  try {
    const posts = await dbService.getAllPosts();
    retrievalResult.value = `Total posts: ${posts.length}\n` + JSON.stringify(posts.slice(0, 1), null, 2) + '...';
  } catch (err) {
    retrievalResult.value = 'Error: ' + err;
  }
};

const createPost = async () => {
  try {
    const newPost = {
      id: Date.now(),
      user_id: 888,
      contents: [{ content: 'This is a test post from LocalDBTest', type: 1 }],
      created_on: Math.floor(Date.now() / 1000)
    };
    await dbService.createPost(newPost);
    createStatus.value = `Success: Created post with ID ${newPost.id}`;
    await getAllPosts(); // Refresh list
  } catch (err) {
    createStatus.value = 'Error: ' + err;
  }
};

const backupDB = async () => {
  try {
    backupData.value = await dbService.backupDB();
    backupStatus.value = `Success: Backup created (${backupData.value.length} bytes)`;
  } catch (err) {
    backupStatus.value = 'Error: ' + err;
  }
};

const clearDB = async () => {
   try {
    await paopaoLocalDB.clear('users');
    await paopaoLocalDB.clear('posts');
    await paopaoLocalDB.clear('tags');
    backupStatus.value = 'DB Cleared. Verify by trying to Get Data.';
   } catch (err) {
    backupStatus.value = 'Error: ' + err;
   }
};

const restoreDB = async () => {
  try {
    if (!backupData.value) return;
    await paopaoLocalDB.restore(backupData.value);
    backupStatus.value = 'Success: DB Restored from backup.';
  } catch (err) {
    backupStatus.value = 'Error: ' + err;
  }
};
</script>

<style scoped>
.local-db-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.card {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
}
button {
  margin-right: 10px;
  padding: 8px 16px;
  cursor: pointer;
}
.status {
  margin-top: 10px;
  color: green;
  font-weight: bold;
}
.result {
  background: #f5f5f5;
  padding: 10px;
  margin-top: 10px;
  overflow-x: auto;
}
</style>
