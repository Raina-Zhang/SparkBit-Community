<template>
    <div class="comment-item">
        <n-thing content-indented>
            <template #avatar>
                <n-avatar round :size="30" :src="comment.user.avatar" />
            </template>
            <template #header>
                <span class="nickname-wrap">
                    <router-link
                        @click.stop
                        class="username-link"
                        :to="{
                            name: 'user',
                            query: { s: comment.user.username },
                        }"
                    >
                        {{ comment.user.nickname }}
                    </router-link>
                </span>
                <n-tag
                    v-if="comment.is_essence == YesNoEnum.YES"
                    class="top-tag"
                    type="warning"
                    size="small"
                    round
                >
                    置顶
                </n-tag>
            </template>
            <template #header-extra>
                <div class="opt-wrap">
                    <span class="timestamp">
                        {{ formatPrettyTime(comment.created_on) }}
                    </span>
                    <n-popconfirm
                        v-if="store.state.userInfo.id === postUserId"
                        negative-text="取消"
                        positive-text="确认"
                        @positive-click="execHightlightAction"
                    >
                        <template #trigger>
                            <n-button
                                quaternary
                                circle
                                size="tiny"
                                class="action-btn"
                            >
                                <template #icon>
                                    <n-icon v-if="comment.is_essence == YesNoEnum.NO">
                                        <ArrowBarToUp />
                                    </n-icon>
                                    <n-icon v-else>
                                        <ArrowBarDown />
                                    </n-icon>
                                </template>
                            </n-button>
                        </template>
                        {{ comment.is_essence == YesNoEnum.NO ? "是否置顶这条评论" : "是否取消置顶"}}
                    </n-popconfirm>
                    <n-popconfirm
                        v-if="
                            store.state.userInfo.is_admin ||
                            store.state.userInfo.id === comment.user.id
                        "
                        negative-text="取消"
                        positive-text="确认"
                        @positive-click="execDelAction"
                    >
                        <template #trigger>
                            <n-button
                                quaternary
                                circle
                                size="tiny"
                                class="action-btn"
                            >
                                <template #icon>
                                    <n-icon>
                                        <trash />
                                    </n-icon>
                                </template>
                            </n-button>
                        </template>
                        是否删除这条评论？
                    </n-popconfirm>
                </div>
            </template>
            <template #description v-if="comment.texts.length > 0">
                <span
                    v-for="content in comment.texts"
                    :key="content.id"
                    class="comment-text"
                    @click.stop="doClickText($event, comment.id)"
                    v-html="parsePostTag(content.content).content"
                ></span>
            </template>

            <template #footer>
                <post-image
                    v-if="comment.imgs.length > 0"
                    :imgs="comment.imgs" />
            </template>
        </n-thing>
    </div>
</template>

<script setup lang="ts">
import { deleteComment, highlightComment } from '@/api/post';
import { YesNoEnum } from '@/utils/IEnum';
import { parsePostTag } from '@/utils/content';
import { formatPrettyTime } from '@/utils/formatTime';
import { ArrowBarDown, ArrowBarToUp, Trash } from '@vicons/tabler';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const router = useRouter();

const emit = defineEmits<(e: 'reload') => void>();
const props = withDefaults(
  defineProps<{
    comment: Item.CommentProps;
    postUserId: number;
  }>(),
  {},
);

const comment = computed(() => {
  const comment: Item.CommentComponentProps = Object.assign(
    {
      texts: [],
      imgs: [],
    },
    props.comment,
  );
  comment.contents.map((content: any) => {
    if (+content.type === 1 || +content.type === 2) {
      comment.texts.push(content);
    }
    if (+content.type === 3) {
      comment.imgs.push(content);
    }
  });
  return comment;
});

const doClickText = (e: MouseEvent, id: number | string) => {
  const _target = e.target as any;
  if (_target.dataset.detail) {
    const d = _target.dataset.detail.split(':');
    if (d.length === 2) {
      store.commit('refresh');
      if (d[0] === 'tag') {
        window.$message.warning('评论内的无效话题');
      } else {
        router.push({
          name: 'user',
          query: {
            s: d[1],
          },
        });
      }
    }
  }
};

const reload = () => {
  emit('reload');
};

const execDelAction = () => {
  deleteComment({
    id: comment.value.id,
  })
    .then((_res) => {
      window.$message.success('删除成功');
      setTimeout(() => {
        reload();
      }, 50);
    })
    .catch((_err) => {});
};

const execHightlightAction = () => {
  highlightComment({
    id: comment.value.id,
  })
    .then((res) => {
      comment.value.is_essence = res.highlight_status;
      window.$message.success('操作成功');
      setTimeout(() => {
        reload();
      }, 50);
    })
    .catch((_err) => {});
};
</script>

<style lang="less" scoped>
.comment-item {
    width: 100%;
    padding: 16px;
    box-sizing: border-box;

    .nickname-wrap {
        font-size: 14px;
    }
    .username-wrap {
        font-size: 14px;
        opacity: 0.75;
    }
    .top-tag {
        transform: scale(0.75);
    }
    .opt-wrap {
        display: flex;
        align-items: center;
        .timestamp {
            opacity: 0.75;
            font-size: 12px;
        }
        .action-btn {
            margin-left: 4px;
        }
    }
    .comment-text {
        display: block;
        text-align: justify;
        overflow: hidden;
        white-space: pre-wrap;
        word-break: break-all;
    }
    .opt-item {
        display: flex;
        align-items: center;
        opacity: 0.7;
        .opt-item-icon {
            margin-right: 10px;
        }
    }
}

.dark {
    .comment-item {
        background-color: rgba(16, 16, 20, 0.75);
    }
}
</style>