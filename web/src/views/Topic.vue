<template>
    <div>
        <main-nav title="话题" />

        <div class="main-content-wrap tags-wrap">
            <n-tabs type="line" animated :value="currentTab" @update:value="handleTabChange">
                <n-tab-pane name="hot" tab="热门" />
                <n-tab-pane name="web3" tab="Web3" />
                <n-tab-pane name="currency" tab="币种" />
                <n-tab-pane name="activity" tab="活动" />
                <n-tab-pane name="all" tab="全部" />
            </n-tabs>

            <n-spin :show="loading">
                <div class="tags-container">
                    <n-space>
                        <tag-item
                            v-for="tag in tags"
                            :key="tag.id || tag.tag"
                            :tag="tag"
                            :showAction="store.state.userLogined && tagsChecked"
                            :checkFollowing="inFollowTab"
                            :checkPin="inPinTab"
                        >
                        </tag-item>
                    </n-space>
                    <div class="empty-wrap" v-if="tags.length === 0">
                        <n-empty size="large" description="暂无数据" />
                    </div>
                </div>
            </n-spin>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getTags } from '@/api/post';
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { activityTags, currencyTags, web3Tags } from '@/utils/tagCategories';

const store = useStore();
const tags = ref<Item.TagProps[]>([]);
const currentTab = ref('hot');
const loading = ref(false);
const tagsChecked = ref(false);
const inFollowTab = ref(false);
const inPinTab = ref(false);

const loadTags = (tab: string) => {
    loading.value = true;
    tags.value = [];
    currentTab.value = tab;

    if (tab === 'web3') {
        tags.value = web3Tags.map((t, idx) => ({
            id: 10000 + idx,
            user_id: 0,
            tag: t,
            quote_num: Math.floor(Math.random() * 1000),
            is_following: false,
            is_top: false,
        }));
        loading.value = false;
        return;
    }

    if (tab === 'currency') {
        tags.value = currencyTags.map((t, idx) => ({
            id: 20000 + idx,
            user_id: 0,
            tag: t,
            quote_num: Math.floor(Math.random() * 5000),
            is_following: false,
            is_top: false,
        }));
        loading.value = false;
        return;
    }

    if (tab === 'activity') {
        tags.value = activityTags.map((t, idx) => ({
            id: t.id || 30000 + idx,
            user_id: 0,
            tag: t.tag,
            quote_num: t.quote_num || 0,
            is_following: false,
            is_top: false,
        }));
        loading.value = false;
        return;
    }

    // API calls for Hot and All
    let type = 'hot_extral'; // Default for Hot
    if (tab === 'all') {
        type = 'hot'; // Or 'new'
    }

    getTags({
        type: type,
        num: 50,
    })
        .then((res) => {
            tags.value = res.topics;
            loading.value = false;
        })
        .catch((err) => {
            console.log(err);
            loading.value = false;
        });
};

const handleTabChange = (value: string) => {
    loadTags(value);
};

onMounted(() => {
    loadTags('hot');
});
</script>

<style lang="less" scoped>
.tags-wrap {
    padding: 20px;
    background-color: #fff;
    min-height: 500px;
}
.tags-container {
    margin-top: 20px;
}
.dark {
    .tags-wrap, .empty-wrap {
        background-color: rgba(16, 16, 20, 0.75);
    }
}
</style>
