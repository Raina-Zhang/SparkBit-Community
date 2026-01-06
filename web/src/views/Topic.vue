<template>
    <div>
        <main-nav title="话题" />

        <n-list class="main-content-wrap tags-wrap" bordered>
            <n-spin :show="loading">
                <n-space>
                    <tag-item
                        v-for="tag in tags"
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
            </n-spin>
        </n-list>
    </div>
</template>

<script setup lang="ts">
import { getTags } from '@/api/post';
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const tags = ref<Item.TagProps[]>([]);
const tagType = ref<'hot' | 'new' | 'follow' | 'pin'>('hot');
const loading = ref(false);
const tagsChecked = ref(false);
const inFollowTab = ref(false);
const inPinTab = ref(false);

const loadTags = () => {
  loading.value = true;
  getTags({
    type: tagType.value,
    num: 50,
  })
    .then((res) => {
      tags.value = res.topics;
      loading.value = false;
    })
    .catch((err) => {
      tags.value = [];
      console.log(err);
      loading.value = false;
    });
};

onMounted(() => {
  loadTags();
});
</script>

<style lang="less" scoped>
.tags-wrap {
    padding: 20px;
}
.dark {
    .tags-wrap, .empty-wrap {
        background-color: rgba(16, 16, 20, 0.75);
    }
}
</style>