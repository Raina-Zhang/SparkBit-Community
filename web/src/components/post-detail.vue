<template>
    <div class="detail-item" @click="goPostDetail(post.id)">
        <n-thing>
            <template #avatar>
                <n-avatar round :size="30" :src="post.user.avatar" />
            </template>
            <template #header>
                <div class="post-header">
                    <div class="post-header-top">
                        <router-link
                            @click.stop
                            class="username-link"
                            :to="{
                                name: 'user',
                                query: { s: post.user.username },
                            }"
                        >
                            {{ post.user.nickname }}
                        </router-link>
                        <n-tag
                            v-if="post.is_top"
                            class="top-tag"
                            type="warning"
                            size="small"
                            round
                        >
                            置顶
                        </n-tag>
                        <n-tag
                            v-if="post.visibility == VisibilityEnum.PRIVATE"
                            class="top-tag"
                            type="error"
                            size="small"
                            round
                        >
                            私密
                        </n-tag>
                        <n-tag
                            v-if="post.visibility == VisibilityEnum.FRIEND"
                            class="top-tag"
                            type="info"
                            size="small"
                            round
                        >
                            好友可见
                        </n-tag>
                    </div>
                    <div class="post-header-bottom">
                        <div class="timestamp">
                            发布于 {{ formatPrettyTime(post.created_on) }}
                            <span v-if="!store.state.collapsedLeft && post.created_on != post.latest_replied_on">
                                <n-divider vertical /> 最后回复
                                {{ formatPrettyTime(post.latest_replied_on) }}
                            </span>
                        </div>
                    </div>
                </div>
            </template>
            <template #header-extra>
                <div class="options">
                    <n-dropdown
                        placement="bottom-end"
                        trigger="click"
                        size="small"
                        :options="adminOptions"
                        @select="handlePostAction"
                    >
                        <n-button quaternary circle>
                            <template #icon>
                                <n-icon>
                                    <more-horiz-filled />
                                </n-icon>
                            </template>
                        </n-button>
                    </n-dropdown>
                </div>

                <!-- 删除确认 -->
                <n-modal
                    v-model:show="showDelModal"
                    :mask-closable="false"
                    preset="dialog"
                    title="提示"
                    content="确定删除该动态吗？"
                    positive-text="确认"
                    negative-text="取消"
                    @positive-click="execDelAction"
                />
                <!-- 锁定确认 -->
                <n-modal
                    v-model:show="showLockModal"
                    :mask-closable="false"
                    preset="dialog"
                    title="提示"
                    :content="
                        '确定' +
                        (post.is_lock ? '解锁' : '锁定') +
                        '该动态吗？'
                    "
                    positive-text="确认"
                    negative-text="取消"
                    @positive-click="execLockAction"
                />
                <!-- 置顶确认 -->
                <n-modal
                    v-model:show="showStickModal"
                    :mask-closable="false"
                    preset="dialog"
                    title="提示"
                    :content="
                        '确定' +
                        (post.is_top ? '取消置顶' : '置顶') +
                        '该动态吗？'
                    "
                    positive-text="确认"
                    negative-text="取消"
                    @positive-click="execStickAction"
                />
                <!-- 亮点确认 -->
                <n-modal
                    v-model:show="showHighlightModal"
                    :mask-closable="false"
                    preset="dialog"
                    title="提示"
                    :content="
                        '确定将该动态' +
                        (post.is_essence ? '取消亮点' : '设为亮点') +
                        '吗？'
                    "
                    positive-text="确认"
                    negative-text="取消"
                    @positive-click="execHighlightAction"
                />
                <!-- 修改可见度确认 -->
                <n-modal
                    v-model:show="showVisibilityModal"
                    :mask-closable="false"
                    preset="dialog"
                    title="提示"
                    :content="
                        '确定将该动态可见度修改为' +
                        (tempVisibility == 0 ? '公开' : (tempVisibility == 1 ? '私密' : (tempVisibility == 2 ? '好友可见' : '关注可见'))) +
                        '吗？'
                    "
                    positive-text="确认"
                    negative-text="取消"
                    @positive-click="execVisibilityAction"
                />
                  <!-- 私信组件 -->
                <whisper :show="showWhisper" :user="whisperReceiver" @success="whisperSuccess" />
            </template>
            <div v-if="post.texts.length > 0">
                <span
                    v-for="content in post.texts"
                    :key="content.id"
                    class="post-text"
                    @click.stop="doClickText($event, post.id)"
                    v-html="parsePostTag(content.content).content"
                >
                </span>
            </div>

            <template #footer>
                <post-attachment :attachments="post.attachments" />
                <post-attachment
                    :attachments="post.charge_attachments"
                    :price="post.attachment_price"
                />
                <post-image :imgs="post.imgs" />
                <post-video :videos="post.videos" :full="true" />
                <post-link :links="post.links" />
            </template>
            <template #action>
                <div class="opts-wrap">
                    <n-space justify="space-between">
                        <div
                            class="opt-item hover"
                            @click.stop="handlePostStar"
                        >
                            <n-icon size="20" class="opt-item-icon">
                                <flash-outline v-if="!hasStarred" />
                                <flash v-if="hasStarred" color="#f5a623" />
                            </n-icon>
                            {{ post.upvote_count }}
                        </div>
                        <div class="opt-item">
                            <n-icon size="20" class="opt-item-icon">
                                <chatbox-outline />
                            </n-icon>
                            {{ post.comment_count }}
                        </div>
                        <div
                            class="opt-item hover"
                            @click.stop="handlePostCollection"
                        >
                            <n-icon size="20" class="opt-item-icon">
                                <bookmark-outline v-if="!hasCollected" />
                                <bookmark v-if="hasCollected" color="#ff7600" />
                            </n-icon>
                            {{ post.collection_count }}
                        </div>
                        <n-dropdown
                            placement="bottom-end"
                            trigger="hover"
                            size="small"
                            :options="tweetOptions"
                            @select="handleTweetAction"
                        >
                            <div class="opt-item hover" @click.stop>
                                <n-icon size="20" class="opt-item-icon">
                                    <share-social-outline />
                                </n-icon>
                            </div>
                        </n-dropdown>
                    </n-space>
                </div>
            </template>
        </n-thing>
    </div>
</template>

<script setup lang="ts">
import {
  deletePost,
  getPostCollection,
  getPostStar,
  highlightPost,
  lockPost,
  postCollection,
  postStar,
  stickPost,
  visibilityPost,
} from '@/api/post';
import { followUser, unfollowUser } from '@/api/user';
import { VisibilityEnum } from '@/utils/IEnum';
import { parsePostTag } from '@/utils/content';
import { formatPrettyTime } from '@/utils/formatTime';
import { Discord, Link, Telegram, Twitter } from '@vicons/fa';
import {
  BodyOutline,
  Bookmark,
  BookmarkOutline,
  ChatboxOutline,
  EyeOffOutline,
  EyeOutline,
  FlameOutline,
  Flash,
  FlashOutline,
  LockClosedOutline,
  LockOpenOutline,
  PaperPlaneOutline,
  PersonOutline,
  PushOutline,
  ShareSocialOutline,
  TrashOutline,
  WalkOutline,
} from '@vicons/ionicons5';
import { MoreHorizFilled } from '@vicons/material';
import copy from 'copy-to-clipboard';
import { NIcon, useDialog } from 'naive-ui';
import type { DropdownOption } from 'naive-ui';
import { computed, h, onMounted, ref } from 'vue';
import type { Component } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const useFriendship =
  import.meta.env.VITE_USE_FRIENDSHIP.toLowerCase() === 'true';

const store = useStore();
const router = useRouter();
const dialog = useDialog();
const hasStarred = ref(false);
const hasCollected = ref(false);
const props = withDefaults(
  defineProps<{
    post: Item.PostProps;
  }>(),
  {},
);
const showDelModal = ref(false);
const showLockModal = ref(false);
const showStickModal = ref(false);
const showHighlightModal = ref(false);
const showVisibilityModal = ref(false);
const loading = ref(false);
const tempVisibility = ref<VisibilityEnum>(VisibilityEnum.PUBLIC);
const showWhisper = ref(false);
const whisperReceiver = ref<Item.UserInfo>({
  id: 0,
  avatar: '',
  username: '',
  nickname: '',
  is_admin: false,
  is_friend: true,
  is_following: false,
  created_on: 0,
  follows: 0,
  followings: 0,
  status: 1,
});

const onSendWhisper = (user: Item.UserInfo) => {
  whisperReceiver.value = user;
  showWhisper.value = true;
};

const whisperSuccess = () => {
  showWhisper.value = false;
};

const emit = defineEmits<(e: 'reload', post_id: number) => void>();

const post = computed({
  get: () => {
    const post: Item.PostComponentProps = Object.assign(
      {
        texts: [],
        imgs: [],
        videos: [],
        links: [],
        attachments: [],
        charge_attachments: [],
      },
      props.post,
    );
    post.contents.map((content) => {
      if (+content.type === 1 || +content.type === 2) {
        post.texts.push(content);
      }
      if (+content.type === 3) {
        post.imgs.push(content);
      }
      if (+content.type === 4) {
        post.videos.push(content);
      }
      if (+content.type === 6) {
        post.links.push(content);
      }
      if (+content.type === 7) {
        post.attachments.push(content);
      }
      if (+content.type === 8) {
        post.charge_attachments.push(content);
      }
    });
    return post;
  },
  set: (newVal) => {
    props.post.upvote_count = newVal.upvote_count;
    props.post.comment_count = newVal.comment_count;
    props.post.collection_count = newVal.collection_count;
    props.post.is_essence = newVal.is_essence;
  },
});

const renderIcon = (icon: Component) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon),
    });
  };
};

const adminOptions = computed(() => {
  const options: DropdownOption[] = [];
  if (
    !store.state.userInfo.is_admin &&
    store.state.userInfo.id != props.post.user.id
  ) {
    options.push({
      label: '私信 @' + props.post.user.username,
      key: 'whisper',
      icon: renderIcon(PaperPlaneOutline),
    });
    if (props.post.user.is_following) {
      options.push({
        label: '取消关注 @' + props.post.user.username,
        key: 'unfollow',
        icon: renderIcon(WalkOutline),
      });
    } else {
      options.push({
        label: '关注 @' + props.post.user.username,
        key: 'follow',
        icon: renderIcon(BodyOutline),
      });
    }
    return options;
  }
  options.push({
    label: '删除',
    key: 'delete',
    icon: renderIcon(TrashOutline),
  });
  if (post.value.is_lock === 0) {
    options.push({
      label: '锁定',
      key: 'lock',
      icon: renderIcon(LockClosedOutline),
    });
  } else {
    options.push({
      label: '解锁',
      key: 'unlock',
      icon: renderIcon(LockOpenOutline),
    });
  }
  if (store.state.userInfo.is_admin) {
    if (post.value.is_top === 0) {
      options.push({
        label: '置顶',
        key: 'stick',
        icon: renderIcon(PushOutline),
      });
    } else {
      options.push({
        label: '取消置顶',
        key: 'unstick',
        icon: renderIcon(PushOutline),
      });
    }
  }
  if (post.value.is_essence === 0) {
    options.push({
      label: '设为亮点',
      key: 'highlight',
      icon: renderIcon(FlameOutline),
    });
  } else {
    options.push({
      label: '取消亮点',
      key: 'unhighlight',
      icon: renderIcon(FlameOutline),
    });
  }
  let visitMenu: DropdownOption;
  if (post.value.visibility === VisibilityEnum.PUBLIC) {
    visitMenu = {
      label: '公开',
      key: 'vpublic',
      icon: renderIcon(EyeOutline),
      children: [
        { label: '私密', key: 'vprivate', icon: renderIcon(EyeOffOutline) },
        { label: '关注可见', key: 'vfollowing', icon: renderIcon(BodyOutline) },
      ],
    };
  } else if (post.value.visibility === VisibilityEnum.PRIVATE) {
    visitMenu = {
      label: '私密',
      key: 'vprivate',
      icon: renderIcon(EyeOffOutline),
      children: [
        { label: '公开', key: 'vpublic', icon: renderIcon(EyeOutline) },
        { label: '关注可见', key: 'vfollowing', icon: renderIcon(BodyOutline) },
      ],
    };
  } else if (useFriendship && post.value.visibility === VisibilityEnum.FRIEND) {
    visitMenu = {
      label: '好友可见',
      key: 'vfriend',
      icon: renderIcon(PersonOutline),
      children: [
        { label: '公开', key: 'vpublic', icon: renderIcon(EyeOutline) },
        { label: '私密', key: 'vprivate', icon: renderIcon(EyeOffOutline) },
        { label: '关注可见', key: 'vfollowing', icon: renderIcon(BodyOutline) },
      ],
    };
  } else {
    visitMenu = {
      label: '关注可见',
      key: 'vfollowing',
      icon: renderIcon(BodyOutline),
      children: [
        { label: '公开', key: 'vpublic', icon: renderIcon(EyeOutline) },
        { label: '私密', key: 'vprivate', icon: renderIcon(EyeOffOutline) },
      ],
    };
  }
  if (useFriendship && post.value.visibility !== VisibilityEnum.FRIEND) {
    visitMenu.children?.push({
      label: '好友可见',
      key: 'vfriend',
      icon: renderIcon(PersonOutline),
    });
  }
  options.push(visitMenu);
  return options;
});

const tweetOptions = computed(() => {
  const options: DropdownOption[] = [
    { label: 'Telegram', key: 'telegram', icon: renderIcon(Telegram) },
    { label: 'X', key: 'twitter', icon: renderIcon(Twitter) },
    { label: 'Discord', key: 'discord', icon: renderIcon(Discord) },
    { label: '复制链接', key: 'copyTweetLink', icon: renderIcon(Link) },
  ];
  return options;
});

const onHandleFollowAction = (post: Item.PostProps) => {
  dialog.success({
    title: '提示',
    content:
      '确定' +
      (post.user.is_following ? '取消关注 @' : '关注 @') +
      props.post.user.username +
      ' 吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      if (post.user.is_following) {
        unfollowUser({
          user_id: post.user.id,
        })
          .then((_res) => {
            window.$message.success('操作成功');
            post.user.is_following = false;
          })
          .catch((_err) => {});
      } else {
        followUser({
          user_id: post.user.id,
        })
          .then((_res) => {
            window.$message.success('操作成功');
            post.user.is_following = true;
          })
          .catch((_err) => {});
      }
    },
  });
};

const goPostDetail = (id: number) => {
  router.push({
    name: 'post',
    query: {
      id,
    },
  });
};
const doClickText = (e: MouseEvent, id: number) => {
  if ((e.target as any).dataset.detail) {
    const d = (e.target as any).dataset.detail.split(':');
    if (d.length === 2) {
      store.commit('refresh');
      if (d[0] === 'tag') {
        router.push({
          name: 'home',
          query: {
            q: d[1],
            t: 'tag',
          },
        });
      } else {
        router.push({
          name: 'user',
          query: {
            s: d[1],
          },
        });
      }
      return;
    }
  }
  goPostDetail(id);
};
const handlePostAction = (
  item:
    | 'whisper'
    | 'follow'
    | 'unfollow'
    | 'delete'
    | 'lock'
    | 'unlock'
    | 'stick'
    | 'unstick'
    | 'highlight'
    | 'unhighlight'
    | 'vpublic'
    | 'vprivate'
    | 'vfriend'
    | 'vfollowing',
) => {
  switch (item) {
    case 'whisper':
      onSendWhisper(props.post.user);
      break;
    case 'follow':
    case 'unfollow':
      onHandleFollowAction(props.post);
      break;
    case 'delete':
      showDelModal.value = true;
      break;
    case 'lock':
    case 'unlock':
      showLockModal.value = true;
      break;
    case 'stick':
    case 'unstick':
      showStickModal.value = true;
      break;
    case 'highlight':
    case 'unhighlight':
      showHighlightModal.value = true;
      break;
    case 'vpublic':
      tempVisibility.value = 0;
      showVisibilityModal.value = true;
      break;
    case 'vprivate':
      tempVisibility.value = 1;
      showVisibilityModal.value = true;
      break;
    case 'vfriend':
      tempVisibility.value = 2;
      showVisibilityModal.value = true;
      break;
    case 'vfollowing':
      tempVisibility.value = 3;
      showVisibilityModal.value = true;
      break;
    default:
      break;
  }
};
const execDelAction = () => {
  deletePost({
    id: post.value.id,
  })
    .then((_res) => {
      window.$message.success('删除成功');
      router.replace('/');

      setTimeout(() => {
        store.commit('refresh');
      }, 50);
    })
    .catch((_err) => {
      loading.value = false;
    });
};
const execLockAction = () => {
  lockPost({
    id: post.value.id,
  })
    .then((res) => {
      emit('reload', post.value.id);
      if (res.lock_status === 1) {
        window.$message.success('锁定成功');
      } else {
        window.$message.success('解锁成功');
      }
    })
    .catch((_err) => {
      loading.value = false;
    });
};
const execStickAction = () => {
  stickPost({
    id: post.value.id,
  })
    .then((res) => {
      emit('reload', post.value.id);
      if (res.top_status === 1) {
        window.$message.success('置顶成功');
      } else {
        window.$message.success('取消置顶成功');
      }
    })
    .catch((_err) => {
      loading.value = false;
    });
};
const execHighlightAction = () => {
  highlightPost({
    id: post.value.id,
  })
    .then((res) => {
      post.value = {
        ...post.value,
        is_essence: res.highlight_status,
      };
      if (res.highlight_status === 1) {
        window.$message.success('设为亮点成功');
      } else {
        window.$message.success('取消亮点成功');
      }
    })
    .catch((_err) => {
      loading.value = false;
    });
};
const execVisibilityAction = () => {
  visibilityPost({
    id: post.value.id,
    visibility: tempVisibility.value,
  })
    .then((_res) => {
      emit('reload', post.value.id);
      window.$message.success('修改可见性成功');
    })
    .catch((_err) => {
      loading.value = false;
    });
};
const handlePostStar = () => {
  postStar({
    id: post.value.id,
  })
    .then((res) => {
      hasStarred.value = res.status;
      if (res.status) {
        post.value = {
          ...post.value,
          upvote_count: post.value.upvote_count + 1,
        };
      } else {
        post.value = {
          ...post.value,
          upvote_count: post.value.upvote_count - 1,
        };
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
const handlePostCollection = () => {
  postCollection({
    id: post.value.id,
  })
    .then((res) => {
      hasCollected.value = res.status;
      if (res.status) {
        post.value = {
          ...post.value,
          collection_count: post.value.collection_count + 1,
        };
      } else {
        post.value = {
          ...post.value,
          collection_count: post.value.collection_count - 1,
        };
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
const handleTweetAction = (
  item: 'copyTweetLink' | 'telegram' | 'twitter' | 'discord',
) => {
  try {
    const url = encodeURIComponent(
      `${window.location.origin}/#/post?id=${post.value.id}`,
    );
    const title =
      post.value.texts.length > 0
        ? post.value.texts[0].content.substring(0, 50) + '...'
        : '分享动态';
    const text = encodeURIComponent(title);
    switch (item) {
      case 'telegram':
        const tgWin = window.open(
          `https://t.me/share/url?url=${url}&text=${text}`,
          '_blank',
        );
        if (!tgWin) throw new Error('Telegram popup blocked');
        break;
      case 'twitter':
        const twWin = window.open(
          `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
          '_blank',
        );
        if (!twWin) throw new Error('Twitter popup blocked');
        break;
      case 'discord':
        if (!copy(`${window.location.origin}/#/post?id=${post.value.id}`)) {
          throw new Error('Clipboard copy failed');
        }
        window.$message.success('链接已复制，请在 Discord 中粘贴分享');
        break;
      case 'copyTweetLink':
        if (
          !copy(
            `${window.location.origin}/#/post?id=${post.value.id}&share=copy_link&t=${new Date().getTime()}`,
          )
        ) {
          throw new Error('Clipboard copy failed');
        }
        window.$message.success('链接已复制到剪贴板');
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Share failed:', error);
    window.$message.error('分享操作失败，请检查浏览器设置');
  }
};

onMounted(() => {
  if (store.state.userInfo.id > 0) {
    getPostStar({
      id: post.value.id,
    })
      .then((res) => {
        hasStarred.value = res.status;
      })
      .catch((err) => {
        console.log(err);
      });

    getPostCollection({
      id: post.value.id,
    })
      .then((res) => {
        hasCollected.value = res.status;
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
</script>

<style lang="less">
.detail-item {
    width: 100%;
    padding: 16px;
    box-sizing: border-box;

    background: #f7f9f9;
    .username-link {
        font-size: 14px;
    }
    .post-header {
        display: flex;
        flex-direction: column;
    }
    .post-header-top {
        display: flex;
        align-items: center;
    }
    .post-header-bottom {
        display: flex;
        align-items: center;
        opacity: 0.75;
        margin-top: 4px;
        .timestamp {
            font-size: 12px;
            margin-top: 0;
        }
    }
    .top-tag {
        transform: scale(0.75);
    }
    .options {
        opacity: 0.75;
    }
    .post-text {
        font-size: 16px;
        text-align: justify;
        overflow: hidden;
        white-space: pre-wrap;
        word-break: break-all;
    }
    .opts-wrap {
        margin-top: 20px;
        .opt-item {
            display: flex;
            align-items: center;
            opacity: 0.7;
            .opt-item-icon {
                margin-right: 10px;
            }
            &.hover {
                cursor: pointer;
            }
        }
    }
    .n-thing {
        .n-thing-avatar-header-wrapper {
            align-items: center;
        }
    }
    .timestamp {
        opacity: 0.75;
        font-size: 12px;
        margin-top: 10px;
    }
}
.dark {
    .detail-item {
        background: #18181c;
    }
}
</style>