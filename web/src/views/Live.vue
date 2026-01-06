<template>
  <div class="live-page">
    <div class="live-main">
      <!-- Top Ad -->
      <div class="ad-banner">
        <n-card class="ad-card" :bordered="false" content-style="padding: 0;">
          <div class="ad-content-wrapper">
             <div class="ad-text">
                <h3>申请成为主播</h3>
                <p>分享你的投资策略，建立你的社区</p>
             </div>
             <n-button type="primary" secondary round class="apply-btn">立即申请</n-button>
          </div>
        </n-card>
      </div>


      <!-- Live Tabs -->
      <div class="live-tabs-section">
        <n-tabs type="line" animated>
          <n-tab-pane name="all" tab="全部">
            <div class="live-grid">
              <n-card v-for="live in ongoingLives" :key="live.id" hoverable class="live-card">
                <template #cover>
                  <img :src="live.cover" class="live-cover" />
                </template>
                <div class="live-info">
                  <div class="live-title">{{ live.title }}</div>
                  <div class="live-streamer">
                    <n-avatar round size="small" :src="live.avatar" />
                    <span class="streamer-name">{{ live.streamer }}</span>
                  </div>
                  <div class="live-tags">
                    <n-tag size="small" type="success">{{ live.category }}</n-tag>
                    <span class="viewer-count">{{ live.viewers }} 人观看</span>
                  </div>
                </div>
              </n-card>
            </div>
          </n-tab-pane>
          <n-tab-pane name="market" tab="行情分析"><div class="empty-placeholder">暂无直播</div></n-tab-pane>
          <n-tab-pane name="strategy" tab="投资策略"><div class="empty-placeholder">暂无直播</div></n-tab-pane>
          <n-tab-pane name="project" tab="项目解读"><div class="empty-placeholder">暂无直播</div></n-tab-pane>
          <n-tab-pane name="game" tab="游戏专区"><div class="empty-placeholder">暂无直播</div></n-tab-pane>
          <n-tab-pane name="blockchain" tab="区块链知识"><div class="empty-placeholder">暂无直播</div></n-tab-pane>
          <n-tab-pane name="other" tab="其他"><div class="empty-placeholder">暂无直播</div></n-tab-pane>
        </n-tabs>
      </div>

      <!-- Hot Streamers (Horizontal) -->
      <div class="hot-streamers-section">
        <div class="section-header">
           <span class="section-title">热门主播</span>
        </div>
        <div class="hot-streamers-grid">
          <div v-for="streamer in hotStreamers" :key="streamer.id" class="streamer-card" @click="goToStreamerLive(streamer)">
             <n-thing content-indented>
               <template #avatar>
                 <n-avatar round :size="40" :src="streamer.avatar" />
               </template>
               <template #header>
                 <div class="streamer-name">{{ streamer.username }}</div>
               </template>
               <template #description>
                 <div class="streamer-desc">{{ streamer.desc }}</div>
               </template>
             </n-thing>
          </div>
        </div>
      </div>

      <!-- Ended Lives -->
      <div class="ended-lives-section">
        <h3 class="section-title">已结束直播</h3>
        <div class="live-grid">
          <n-card v-for="live in endedLives" :key="live.id" hoverable class="live-card ended">
            <template #cover>
              <div class="cover-wrapper">
                 <img :src="live.cover" class="live-cover" />
                 <div class="ended-overlay">已结束</div>
              </div>
            </template>
            <div class="live-info">
              <div class="live-title">{{ live.title }}</div>
              <div class="live-streamer">
                <n-avatar round size="small" :src="live.avatar" />
                <span class="streamer-name">{{ live.streamer }}</span>
              </div>
            </div>
          </n-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  NAvatar,
  NButton,
  NCard,
  NList,
  NListItem,
  NTabPane,
  NTabs,
  NTag,
  NThing,
} from 'naive-ui';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const ongoingLives = ref([
  {
    id: 1,
    title: 'BTC 行情深度解析',
    streamer: 'CryptoKing',
    username: 'CryptoKing',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoKing',
    cover: 'https://loremflickr.com/600/338/bitcoin,crypto?random=1',
    category: '行情分析',
    viewers: 1205,
  },
  {
    id: 2,
    title: 'Web3 游戏新趋势',
    streamer: 'GameFiMaster',
    username: 'GameFiMaster',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GameFiMaster',
    cover: 'https://loremflickr.com/600/338/gaming,metaverse?random=2',
    category: '游戏专区',
    viewers: 850,
  },
  {
    id: 3,
    title: '以太坊 Layer2 生态',
    streamer: 'ETHMaxi',
    username: 'ETHMaxi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ETHMaxi',
    cover: 'https://loremflickr.com/600/338/ethereum,blockchain?random=3',
    category: '区块链知识',
    viewers: 560,
  },
]);

const endedLives = ref([
  {
    id: 101,
    title: '昨夜美股回顾',
    streamer: 'MacroEcon',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MacroEcon',
    cover: 'https://loremflickr.com/600/338/stockmarket,finance?random=4',
    category: '投资策略',
  },
  {
    id: 102,
    title: 'NFT 市场分析',
    streamer: 'NFTCollector',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NFTCollector',
    cover: 'https://loremflickr.com/600/338/nft,art?random=5',
    category: '行情分析',
  },
]);

const hotStreamers = ref([
  {
    id: 1,
    username: 'CryptoKing',
    desc: '专注 BTC/ETH 行情分析',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoKing',
  },
  {
    id: 2,
    username: 'GameFiMaster',
    desc: '资深链游玩家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GameFiMaster',
  },
  {
    id: 3,
    username: 'ETHMaxi',
    desc: '以太坊生态布道者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ETHMaxi',
  },
  {
    id: 4,
    username: 'DeFiDegens',
    desc: '寻找百倍币',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DeFiDegens',
  },
]);

const goToStreamerLive = (streamer: any) => {
  router.push({
    name: 'user',
    query: {
      s: streamer.username,
      tab: 'live',
    },
  });
};
</script>

<style scoped>
.live-page {
  display: flex;
  gap: 20px;
  width: 100vw;
  max-width: 1920px;
  margin: 0 auto;
  padding: 20px 0;
  justify-content: center;
  box-sizing: border-box;
}

.live-main {
  width: 100%;
  min-width: 0;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1200px) {
  .live-page {
    flex-direction: column;
    padding: 20px;
    width: 100%;
  }

  .live-main {
    width: 100%;
  }
}

.ad-banner {
  margin-bottom: 20px;
}

.ad-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #efeff5;
}

.ad-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: linear-gradient(to right, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.ad-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.ad-text p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.live-tabs-section {
  margin-bottom: 30px;
}

.live-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.live-card {
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  border: 1px solid #efeff5;
}

.live-card:hover {
  background-color: #f7f9f9;
  border-color: #efeff5;
}

.live-cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
  border-radius: 8px 8px 0 0;
}

.live-info {
  padding: 12px;
}

.live-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

.live-streamer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.streamer-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.live-tags {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.viewer-count {
  font-size: 12px;
  color: #999;
}

.empty-placeholder {
  text-align: center;
  padding: 60px 0;
  color: #999;
  background: #f9f9f9;
  border-radius: 8px;
}

.ended-lives-section .section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  display: flex;
  align-items: center;
}

.cover-wrapper {
  position: relative;
}

.ended-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 8px 8px 0 0;
}

.streamer-desc {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
}

.hot-streamers-section {
  margin-bottom: 40px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.hot-streamers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.streamer-card {
  cursor: pointer;
  background: #fff;
  border: 1px solid #efeff5;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease-in-out;
}

.streamer-card:hover {
  background-color: #f7f9f9;
  border-color: #e0e0e6;
}

/* Dark Mode Adaptation */
:global(.dark) .ad-card {
  background-color: #18181c;
  border-color: rgba(255, 255, 255, 0.09);
}

:global(.dark) .ad-content-wrapper {
  background: rgba(255, 255, 255, 0.02);
}

:global(.dark) .ad-text h3 {
  color: #eee;
}

:global(.dark) .ad-text p {
  color: #aaa;
}

:global(.dark) .live-title,
:global(.dark) .section-title,
:global(.dark) .streamer-name {
  color: #eee;
}

:global(.dark) .streamer-card {
  background: #18181c;
  border-color: rgba(255, 255, 255, 0.09);
}

:global(.dark) .streamer-card:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

:global(.dark) .live-card {
  border-color: rgba(255, 255, 255, 0.09);
}

:global(.dark) .live-card:hover {
  background-color: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.09);
}

:global(.dark) .empty-placeholder {
  background: rgba(255, 255, 255, 0.02);
  color: #666;
}
</style>
