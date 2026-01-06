<template>
    <div class="rightbar-wrap" v-if="!store.state.collapsedRight">
        <div class="search-wrap">
            <div class="search-box">
                <n-input
                    ref="searchInputRef"
                    class="search-input"
                    placeholder="搜索作者，话题或内容"
                    v-model:value="keyword"
                    @keyup.enter.prevent="handleSearch"
                >
                    <template #prefix>
                        <n-icon :component="Search" />
                    </template>
                </n-input>
            </div>
        </div>
        <n-card class="hottopic-wrap" title="热门话题" embedded :bordered="false" size="small">
            <template #header-extra>
                <n-button text size="tiny" @click="router.push({ name: 'topic' })">
                    查看更多
                </n-button>
            </template>
            <n-spin :show="loading">
                <div class="hot-tag-item" v-for="(tag, index) in hotTags" :key="tag.id">
                    <span class="rank-num" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                    <router-link
                        class="hash-link"
                        :to="{
                            name: 'home',
                            query: {
                                q: tag.tag,
                                t: 'tag',
                            },
                        }"
                    >
                        #{{ tag.tag }}
                    </router-link>

                    <div class="post-num">
                        {{ formatQuoteNum(tag.quote_num) }}
                    </div>
                </div>
            </n-spin>
        </n-card>
    </div>
</template>

<script setup lang="ts">
import { getTags } from '@/api/post';
import { Search } from '@vicons/ionicons5';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const hotTags = ref<Item.TagProps[]>([]);
const loading = ref(false);
const keyword = ref('');
const searchInputRef = ref<any>(null);
const store = useStore();
const router = useRouter();

const mockTags: Item.TagProps[] = [
  {
    id: 1001,
    user_id: 0,
    user: {} as Item.UserInfo,
    tag: 'Bitcoin',
    quote_num: 15400,
    created_on: 0,
    is_following: 0,
    is_top: 0,
    is_pin: 0,
    is_del: 0,
  },
  {
    id: 1002,
    user_id: 0,
    user: {} as Item.UserInfo,
    tag: 'Ethereum',
    quote_num: 8900,
    created_on: 0,
    is_following: 0,
    is_top: 0,
    is_pin: 0,
    is_del: 0,
  },
  {
    id: 1003,
    user_id: 0,
    user: {} as Item.UserInfo,
    tag: 'Web3',
    quote_num: 5600,
    created_on: 0,
    is_following: 0,
    is_top: 0,
    is_pin: 0,
    is_del: 0,
  },
  {
    id: 1004,
    user_id: 0,
    user: {} as Item.UserInfo,
    tag: 'DeFi',
    quote_num: 4200,
    created_on: 0,
    is_following: 0,
    is_top: 0,
    is_pin: 0,
    is_del: 0,
  },
  {
    id: 1005,
    user_id: 0,
    user: {} as Item.UserInfo,
    tag: 'NFT',
    quote_num: 3800,
    created_on: 0,
    is_following: 0,
    is_top: 0,
    is_pin: 0,
    is_del: 0,
  },
  {
    id: 1006,
    user_id: 0,
    user: {} as Item.UserInfo,
    tag: 'GameFi',
    quote_num: 2100,
    created_on: 0,
    is_following: 0,
    is_top: 0,
    is_pin: 0,
    is_del: 0,
  },
  {
    id: 1007,
    user_id: 0,
    user: {} as Item.UserInfo,
    tag: 'Metaverse',
    quote_num: 1800,
    created_on: 0,
    is_following: 0,
    is_top: 0,
    is_pin: 0,
    is_del: 0,
  },
  {
    id: 1008,
    user_id: 0,
    user: {} as Item.UserInfo,
    tag: 'DAO',
    quote_num: 1500,
    created_on: 0,
    is_following: 0,
    is_top: 0,
    is_pin: 0,
    is_del: 0,
  },
  {
    id: 1009,
    user_id: 0,
    user: {} as Item.UserInfo,
    tag: 'Layer2',
    quote_num: 1200,
    created_on: 0,
    is_following: 0,
    is_top: 0,
    is_pin: 0,
    is_del: 0,
  },
  {
    id: 1010,
    user_id: 0,
    user: {} as Item.UserInfo,
    tag: 'ZK-Rollup',
    quote_num: 900,
    created_on: 0,
    is_following: 0,
    is_top: 0,
    is_pin: 0,
    is_del: 0,
  },
];

const loadHotTags = () => {
  loading.value = true;
  getTags({
    type: 'hot_extral',
    num: 10,
    extral_num: 0,
  })
    .then((res) => {
      const apiTags = res.topics || [];
      // Combine API tags with mock tags, ensuring we have enough data
      // Filter out duplicates if necessary, but here we prioritize mock tags if api returns few
      const combinedTags = [...apiTags];

      // Add mock tags that are not in apiTags
      mockTags.forEach((mockTag) => {
        if (!combinedTags.some((t) => t.tag === mockTag.tag)) {
          combinedTags.push(mockTag);
        }
      });

      hotTags.value = combinedTags.slice(0, 10);
      loading.value = false;
    })
    .catch((_err) => {
      hotTags.value = mockTags;
      loading.value = false;
    });
};
const formatQuoteNum = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num;
};
const handleSearch = () => {
  router.push({
    name: 'home',
    query: {
      q: keyword.value,
    },
  });
};

watch(
  () => ({
    userLogined: store.state.userLogined,
  }),
  (to, from) => {
    if (to.userLogined) {
      loadHotTags();
    }
  },
);

onMounted(() => {
  loadHotTags();
});
</script>

<style lang="less" scoped>
.rightbar-wrap::-webkit-scrollbar {
  width: 0; /* 隐藏滚动条的宽度 */
  height: 0; /* 隐藏滚动条的高度 */
}
.rightbar-wrap {
    width: 240px;
    position: fixed;
    left: calc(50% + var(--content-main) / 2 + 10px);
    max-height: calc(100vh); /* 调整高度 */
    overflow: auto;
    .search-wrap {
        margin: 12px 0;
        
        .search-box {
            display: flex;
            align-items: center;
            position: relative;
            background: transparent;
            
            .search-input {
                width: 100%;
                
                :deep(.n-input__input-el) {
                    height: 34px;
                }
            }
        }
    }

    .hot-tag-item {
        line-height: 2;
        position: relative;
        display: flex;
        align-items: center;

        .rank-num {
            width: 20px;
            margin-right: 8px;
            font-style: italic;
            font-weight: bold;
            color: #8c8c8c;
            text-align: center;
            flex-shrink: 0;
            
            &.rank-1 { color: #f5222d; }
            &.rank-2 { color: #fa8c16; }
            &.rank-3 { color: #fadb14; }
        }

        .hash-link {
            width: calc(100% - 60px - 28px);
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            display: block;
        }

        .post-num {
            position: absolute;
            right: 0;
            top: 0;
            width: 60px;
            text-align: right;
            line-height: 2;
            opacity: 0.5;
        }
    }

    .hottopic-wrap {
        margin-bottom: 10px;
    }
}
.dark {
    .hottopic-wrap {
        background-color: #18181c;
    }
}
</style>