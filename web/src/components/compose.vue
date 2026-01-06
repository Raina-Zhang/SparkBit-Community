<template>
    <div>
        <div class="compose-wrap" v-if="store.state.userInfo.id > 0">
            <div class="compose-line">
                <n-mention
                    class="compose-input"
                    type="textarea"
                    size="large"
                    autosize
                    :bordered="true"
                    :loading="loading"
                    :value="content"
                    :prefix="['@', '#']"
                    :options="optionsRef"
                    @search="handleSearch"
                    @update:value="changeContent"
                    placeholder="分享币圈内容，说说你的市场观点"
                />
            </div>

            <n-upload
                ref="uploadRef"
                abstract
                list-type="image"
                :multiple="true"
                :max="9"
                :action="uploadGateway"
                :headers="{
                    Authorization: uploadToken,
                }"
                :data="{
                    type: uploadType,
                }"
                :file-list="fileQueue"
                @before-upload="beforeUpload"
                @finish="finishUpload"
                @error="failUpload"
                @remove="removeUpload"
                @update:file-list="updateUpload"
            >
                <div class="compose-line compose-options">
                    <div class="attachment">
                        <n-upload-trigger #="{ handleClick }" abstract>
                            <n-button
                                :disabled="
                                    (fileQueue.length > 0 &&
                                        uploadType === 'public/video') ||
                                    fileQueue.length === 9
                                "
                                @click="
                                    () => {
                                        setUploadType('public/image');
                                        handleClick();
                                    }
                                "
                                quaternary
                                circle
                                type="primary"
                            >
                                <template #icon>
                                    <n-icon
                                        size="20"
                                        color="var(--primary-color)"
                                    >
                                        <image-outline />
                                    </n-icon>
                                </template>
                            </n-button>
                        </n-upload-trigger>

                        <n-upload-trigger
                          v-if="false"
                          #="{ handleClick }" abstract>
                            <n-button
                                :disabled="true"
                                @click="
                                    () => {
                                        setUploadType('public/video');
                                        handleClick();
                                    }
                                "
                                quaternary
                                circle
                                type="primary"
                            >
                                <template #icon>
                                    <n-icon
                                        size="20"
                                        color="var(--primary-color)"
                                    >
                                        <videocam-outline />
                                    </n-icon>
                                </template>
                            </n-button>
                        </n-upload-trigger>

                        <n-upload-trigger
                          v-if="false"
                          #="{ handleClick }" abstract>
                            <n-button
                                :disabled="true"
                                @click="
                                    () => {
                                        setUploadType('attachment');
                                        handleClick();
                                    }
                                "
                                quaternary
                                circle
                                type="primary"
                            >
                                <template #icon>
                                    <n-icon
                                        size="20"
                                        color="var(--primary-color)"
                                    >
                                        <attach-outline />
                                    </n-icon>
                                </template>
                            </n-button>
                        </n-upload-trigger>

                        <n-popover
                            trigger="click"
                            v-model:show="showTagPopover"
                            placement="bottom-start"
                            style="padding: 0; width: 300px;"
                        >
                            <template #trigger>
                                <n-button
                                    quaternary
                                    circle
                                    type="primary"
                                >
                                    <template #icon>
                                        <n-icon size="20" color="var(--primary-color)">
                                            <hash />
                                        </n-icon>
                                    </template>
                                </n-button>
                            </template>
                            <n-tabs type="line" animated justify-content="space-evenly" style="width: 100%">
                                <n-tab-pane name="hot" tab="热门">
                                    <div style="max-height: 300px; overflow-y: auto;">
                                        <n-list hoverable clickable>
                                            <n-list-item v-for="tag in hotTagsList" :key="tag.key" @click="handleTagSelect(tag.key)">
                                                <div style="padding: 8px 12px; cursor: pointer;">{{ tag.label }}</div>
                                            </n-list-item>
                                            <div v-if="hotTagsList.length === 0" style="padding: 12px; text-align: center; color: #999;">暂无数据</div>
                                        </n-list>
                                    </div>
                                </n-tab-pane>
                                <n-tab-pane name="web3" tab="Web3">
                                    <div style="max-height: 300px; overflow-y: auto;">
                                        <n-list hoverable clickable>
                                            <n-list-item v-for="tag in web3TagsList" :key="tag.key" @click="handleTagSelect(tag.key)">
                                                <div style="padding: 8px 12px; cursor: pointer;">{{ tag.label }}</div>
                                            </n-list-item>
                                        </n-list>
                                    </div>
                                </n-tab-pane>
                                <n-tab-pane name="currency" tab="币种">
                                    <div style="max-height: 300px; overflow-y: auto;">
                                        <n-list hoverable clickable>
                                            <n-list-item v-for="tag in currencyTagsList" :key="tag.key" @click="handleTagSelect(tag.key)">
                                                <div style="padding: 8px 12px; cursor: pointer;">{{ tag.label }}</div>
                                            </n-list-item>
                                        </n-list>
                                    </div>
                                </n-tab-pane>
                                <n-tab-pane name="activity" tab="活动">
                                    <div style="max-height: 300px; overflow-y: auto;">
                                        <n-list hoverable clickable>
                                            <n-list-item v-for="tag in activityTagsList" :key="tag.key" @click="handleTagSelect(tag.key)">
                                                <div style="padding: 8px 12px; cursor: pointer;">{{ tag.label }}</div>
                                            </n-list-item>
                                        </n-list>
                                    </div>
                                </n-tab-pane>
                            </n-tabs>
                        </n-popover>


                         <n-button
                            v-if="allowTweetVisibility"
                            quaternary
                            circle
                            type="primary"
                            @click.stop="switchEye"
                        >
                            <template #icon>
                                <n-icon size="20" color="var(--primary-color)">
                                    <eye-outline />
                                </n-icon>
                            </template>
                        </n-button>
                    </div>

                    <div class="submit-wrap">
                        <span class="text-statistic">{{ content.length }}/2000</span>

                        <n-button
                            @click="() => {}"
                            type="primary"
                            secondary
                            round
                            style="margin-right: 8px"
                        >
                            写文章
                        </n-button>

                        <n-button
                            :loading="submitting"
                            @click="submitPost"
                            type="primary"
                            secondary
                            round
                        >
                            发布
                        </n-button>
                    </div>
                </div>

                <div class="attachment-list-wrap">
                    <n-upload-file-list />
                    <div
                        class="attachment-price-wrap"
                        v-if="attachmentContents.length > 0"
                    >
                        <n-input-number
                            v-if="store.state.profile.allowTweetAttachmentPrice"
                            v-model:value="attachmentPrice"
                            :min="0"
                            :max="100000"
                            placeholder="请输入附件价格，0为免费附件"
                        >
                            <template #prefix>
                                <span> 附件价格￥</span>
                            </template>
                        </n-input-number>
                    </div>
                </div>
            </n-upload>

            <div class="eye-wrap" v-if="showEyeSet">
                <n-radio-group v-model:value="visitType" name="radiogroup">
                    <n-space>
                        <n-radio
                            v-for="visit in visibilities"
                            :key="visit.value"
                            :value="visit.value"
                            :label="visit.label"
                        />
                    </n-space>
                </n-radio-group>
            </div>

        </div>

        <div class="compose-wrap" v-else>
            <div class="login-wrap">
                <span class="login-banner"> 登录后，精彩更多</span>
            </div>
            <div v-if="!store.state.profile.allowUserRegister" class="login-only-wrap">
                <n-button
                    strong
                    secondary
                    round
                    type="primary"
                    @click="triggerAuth('signin')"
                >
                    登录
                </n-button>
            </div>
            <div v-if="store.state.profile.allowUserRegister" class="login-wrap">
                <n-button
                    strong
                    secondary
                    round
                    type="primary"
                    @click="triggerAuth('signin')"
                >
                    登录
                </n-button>
                <n-button
                    strong
                    secondary
                    round
                    type="info"
                    @click="triggerAuth('signup')"
                >
                    注册
                </n-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getSuggestTags, getSuggestUsers } from '@/api/user';
import { debounce } from 'lodash';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

import { createPost, getTags } from '@/api/post';
import { activityTags, currencyTags, web3Tags } from '@/utils/tagCategories';
import { PostItemTypeEnum, VisibilityEnum } from '@/utils/IEnum';
import { parsePostTag } from '@/utils/content';
import { isZipFile } from '@/utils/isZipFile';
import {
  AttachOutline,
  EyeOutline,
  ImageOutline,
  VideocamOutline,
} from '@vicons/ionicons5';
import { Hash } from '@vicons/tabler';
import type { MentionOption, UploadFileInfo, UploadInst } from 'naive-ui';

const emit = defineEmits<(e: 'post-success', post: Item.PostProps) => void>();

const store = useStore();

const optionsRef = ref<MentionOption[]>([]);
const tagDropdownOptions = ref<any[]>([]);

const hotTagsList = ref<{ label: string; key: string }[]>([]);
const web3TagsList = ref<{ label: string; key: string }[]>([]);
const currencyTagsList = ref<{ label: string; key: string }[]>([]);
const activityTagsList = ref<{ label: string; key: string }[]>([]);
const showTagPopover = ref(false);

const loadTags = () => {
  getTags({
    type: 'hot_extral',
    num: 10,
    extral_num: 0,
  })
    .then((res) => {
      const hotOptions: { label: string; key: string }[] = [];
      if (res.topics && res.topics.length > 0) {
        res.topics.map((t) => {
          hotOptions.push({
            label: t.tag,
            key: t.tag,
          });
        });
      }
      hotTagsList.value = hotOptions;

      web3TagsList.value = web3Tags.map((tag: string) => ({ label: tag, key: tag }));
      currencyTagsList.value = currencyTags.map((tag: string) => ({ label: tag, key: tag }));
      activityTagsList.value = activityTags.map((item: any) => ({ label: item.tag, key: item.tag }));
    })
    .catch((err) => {
        // Fallback or error handling
        console.error(err);
    });
};
const handleTagSelect = (key: string) => {
  content.value += ` #${key} `;
  showTagPopover.value = false;
};
const loading = ref(false);
const submitting = ref(false);
const showEyeSet = ref(false);
const content = ref('');
const links = ref([]);

const uploadRef = ref<UploadInst>();
const attachmentPrice = ref(0);
const uploadType = ref('public/image');
const fileQueue = ref<UploadFileInfo[]>([]);
const imageContents = ref<Item.CommentItemProps[]>([]);
const videoContents = ref<Item.CommentItemProps[]>([]);
const attachmentContents = ref<Item.AttachmentProps[]>([]);
const visitType = ref<VisibilityEnum>(VisibilityEnum.PUBLIC);
const defaultVisitType = ref<VisibilityEnum>(VisibilityEnum.PUBLIC);

const allowTweetVisibility = ref(
  import.meta.env.VITE_ALLOW_TWEET_VISIBILITY.toLowerCase() === 'true',
);
const uploadGateway = import.meta.env.VITE_HOST + '/v1/attachment';

const uploadToken = computed(() => {
  return 'Bearer ' + localStorage.getItem('PAOPAO_TOKEN');
});

const visibilities = computed(() => {
  const res = [
    { value: VisibilityEnum.PUBLIC, label: '公开' },
    { value: VisibilityEnum.PRIVATE, label: '私密' },
    { value: VisibilityEnum.Following, label: '关注可见' },
  ];
  if (store.state.profile.useFriendship) {
    res.push({ value: VisibilityEnum.FRIEND, label: '好友可见' });
  }
  return res;
});

const switchEye = () => {
  showEyeSet.value = !showEyeSet.value;
};

// 加载at用户列表
const loadSuggestionUsers = debounce((k) => {
  getSuggestUsers({
    k,
  })
    .then((res) => {
      const options: MentionOption[] = [];
      res.suggest.map((i) => {
        options.push({
          label: i,
          value: i,
        });
      });
      optionsRef.value = options;
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
    });
}, 200);

// 加载推荐tag列表
const loadSuggestionTags = debounce((k) => {
  // Local match first
  const localMatches: MentionOption[] = [];
  const keyword = k.toLowerCase();
  
  const allStaticTags = [
       ...web3Tags.map((t: string) => ({ label: t, value: t })),
       ...currencyTags.map((t: string) => ({ label: t, value: t })),
       ...activityTags.map((t: any) => ({ label: t.tag, value: t.tag }))
   ];
 
   allStaticTags.forEach((t) => {
      if (t.label.toLowerCase().includes(keyword)) {
          localMatches.push(t);
      }
  });

  getSuggestTags({
    k,
  })
    .then((res) => {
      const options: MentionOption[] = [...localMatches];
      // Avoid duplicates
      const localValues = new Set(localMatches.map(m => m.value));
      
      res.suggest.map((i) => {
        if (!localValues.has(i)) {
            options.push({
            label: i,
            value: i,
            });
        }
      });
      optionsRef.value = options;
      loading.value = false;
    })
    .catch((err) => {
      // If API fails, at least show local matches
      optionsRef.value = localMatches;
      loading.value = false;
    });
}, 200);

const handleSearch = (k: string, prefix: string) => {
  if (loading.value) {
    return;
  }
  loading.value = true;
  if (prefix === '@') {
    loadSuggestionUsers(k);
  } else {
    loadSuggestionTags(k);
  }
};
const changeContent = (v: string) => {
  if (v.length > 2000) {
    content.value = v.substring(0, 2000);
  } else {
    content.value = v;
  }
};
const setUploadType = (type: string) => {
  uploadType.value = type;
};

const updateUpload = (list: UploadFileInfo[]) => {
  for (let i = 0; i < list.length; i++) {
    var name = list[i].name;
    var basename: string = name.split('.').slice(0, -1).join('.');
    var ext: string = name.split('.').pop()!;
    if (basename.length > 30) {
      list[i].name =
        basename.substring(0, 18) +
        '...' +
        basename.substring(basename.length - 9) +
        '.' +
        ext;
    }
  }
  fileQueue.value = list;
};
const beforeUpload = async (data: any) => {
  // 图片类型校验
  if (
    uploadType.value === 'public/image' &&
    ![
      'image/webp',
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/gif',
    ].includes(data.file.file?.type)
  ) {
    window.$message.warning('图片仅允许 webp/png/jpg/gif 格式');
    return false;
  }

  if (uploadType.value === 'image' && data.file.file?.size > 10485760) {
    window.$message.warning('图片大小不能超过10MB');
    return false;
  }

  // 视频类型校验
  if (
    uploadType.value === 'public/video' &&
    !['video/mp4', 'video/quicktime'].includes(data.file.file?.type)
  ) {
    window.$message.warning('视频仅允许 mp4/mov 格式');
    return false;
  }

  if (uploadType.value === 'public/video' && data.file.file?.size > 104857600) {
    window.$message.warning('视频大小不能超过100MB');
    return false;
  }
  // 附件类型校验
  if (uploadType.value === 'attachment' && !(await isZipFile(data.file.file))) {
    window.$message.warning('附件仅允许 zip 格式');
    return false;
  }

  if (uploadType.value === 'attachment' && data.file.file?.size > 104857600) {
    window.$message.warning('附件大小不能超过100MB');
    return false;
  }

  return true;
};
const finishUpload = ({ file, event }: any): any => {
  try {
    const data = JSON.parse(event.target?.response);

    if (data.code === 0) {
      if (uploadType.value === 'public/image') {
        imageContents.value.push({
          id: file.id,
          content: data.data.content,
        } as Item.CommentItemProps);
      }
      if (uploadType.value === 'public/video') {
        videoContents.value.push({
          id: file.id,
          content: data.data.content,
        } as Item.CommentItemProps);
      }
      if (uploadType.value === 'attachment') {
        attachmentContents.value.push({
          id: file.id,
          content: data.data.content,
        } as Item.AttachmentProps);
      }
    }
  } catch (error) {
    window.$message.error('上传失败');
  }
};
const failUpload = ({ file, event }: any): any => {
  try {
    const data = JSON.parse(event.target?.response);

    if (data.code !== 0) {
      let errMsg = data.msg || '上传失败';
      if (data.details && data.details.length > 0) {
        data.details.map((detail: string) => {
          errMsg += ':' + detail;
        });
      }
      window.$message.error(errMsg);
    }
  } catch (error) {
    window.$message.error('上传失败');
  }
};
const removeUpload = ({ file }: any) => {
  let idx = imageContents.value.findIndex((item) => item.id === file.id);
  if (idx > -1) {
    imageContents.value.splice(idx, 1);
  }
  idx = videoContents.value.findIndex((item) => item.id === file.id);
  if (idx > -1) {
    videoContents.value.splice(idx, 1);
  }
  idx = attachmentContents.value.findIndex((item) => item.id === file.id);
  if (idx > -1) {
    attachmentContents.value.splice(idx, 1);
  }
};

// 发布动态
const submitPost = () => {
  if (content.value.trim().length === 0) {
    window.$message.warning('请输入内容哦');
    return;
  }

  // 解析用户at及tag
  const { tags, users } = parsePostTag(content.value);

  const contents = [];
  let sort = 100;

  contents.push({
    content: content.value,
    type: PostItemTypeEnum.TEXT, // 文字
    sort,
  });

  imageContents.value.map((img) => {
    sort++;
    contents.push({
      content: img.content,
      type: PostItemTypeEnum.IMAGEURL, // 图片
      sort,
    });
  });
  videoContents.value.map((video) => {
    sort++;
    contents.push({
      content: video.content,
      type: PostItemTypeEnum.VIDEOURL, // 视频
      sort,
    });
  });
  attachmentContents.value.map((attachment) => {
    sort++;
    contents.push({
      content: attachment.content,
      type: PostItemTypeEnum.ATTACHMENT, // 附件
      sort,
    });
  });
  if (links.value.length > 0) {
    links.value.map((link) => {
      sort++;
      contents.push({
        content: link,
        type: PostItemTypeEnum.LINKURL, // 链接
        sort,
      });
    });
  }

  submitting.value = true;
  createPost({
    contents,
    tags: Array.from(new Set(tags)),
    users: Array.from(new Set(users)),
    attachment_price: +attachmentPrice.value * 100,
    visibility: visitType.value,
  })
    .then((res) => {
      window.$message.success('发布成功');
      submitting.value = false;
      emit('post-success', res);

      // 置空
      showEyeSet.value = false;
      uploadRef.value?.clear();
      fileQueue.value = [];
      content.value = '';
      links.value = [];
      imageContents.value = [];
      videoContents.value = [];
      attachmentContents.value = [];
      visitType.value = defaultVisitType.value;
    })
    .catch((err) => {
      submitting.value = false;
    });
};
const triggerAuth = (key: string) => {
  store.commit('triggerAuth', true);
  store.commit('triggerAuthKey', key);
};
onMounted(() => {
  loadTags();
  const defaultVisibility = store.state.profile.defaultTweetVisibility;
  if (store.state.profile.useFriendship && defaultVisibility === 'friend') {
    defaultVisitType.value = VisibilityEnum.FRIEND;
  } else if (defaultVisibility === 'following') {
    defaultVisitType.value = VisibilityEnum.Following;
  } else if (defaultVisibility === 'public') {
    defaultVisitType.value = VisibilityEnum.PUBLIC;
  } else {
    defaultVisitType.value = VisibilityEnum.PRIVATE;
  }
  visitType.value = defaultVisitType.value;
});
</script>

<style lang="less">
.compose-wrap {
    width: 100%;
    padding: 16px;
    box-sizing: border-box;

    .compose-line {
        display: flex;
        flex-direction: row;

        .compose-input {
            width: 100%;
            text-align: left;
        }

        &.compose-options {
            margin-top: 12px;
            display: flex;
            justify-content: space-between;

            .submit-wrap {
                display: flex;
                align-items: center;
                .text-statistic {
                    margin-right: 8px;
                    opacity: 0.75;
                }
            }
        }
    }
    .link-wrap {
        margin-left: 42px;
        margin-right: 42px;
    }
    .eye-wrap {
        margin-left: 64px;
    }
    .login-only-wrap {
        display: flex;
        justify-content: center;
        width: 100%;
        button {
            margin: 0 4px;
            width: 50%
        }
    }
    .login-wrap {
        display: flex;
        justify-content: center;
        width: 100%;
        .login-banner {
            margin-bottom: 12px;
            opacity: 0.8;
        }
        button {
            margin: 0 4px;
        }
    }
}
.attachment-list-wrap {
    margin-top: 12px;

    .n-upload-file-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .n-upload-file {
            display: block !important;
            width: 110px;
            height: 110px;
            padding: 0 !important;
            border: none !important;
            background-color: transparent !important;

            &:hover {
                background-color: transparent !important;
            }

            .n-upload-file-info {
                padding: 0 !important;
                height: 100%;
                display: block !important;
                position: relative;

                .n-upload-file-info__thumbnail {
                    width: 100% !important;
                    height: 100% !important;
                    margin: 0 !important;
                    border-radius: 8px;
                    overflow: hidden;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }

                .n-upload-file-info__name {
                    display: none !important;
                }

                .n-upload-file-info__action {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    margin: 0 !important;
                    z-index: 10;

                    .n-button:nth-last-child(n+2) {
                        display: none !important;
                    }

                    .n-button {
                        background-color: rgba(0, 0, 0, 0.5);
                        color: white;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        min-width: 20px;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: none;

                        .n-icon {
                            font-size: 14px;
                        }

                        &:hover {
                            background-color: rgba(0, 0, 0, 0.7);
                            color: white;
                        }
                    }
                }
            }
        }
    }
}
.dark {
    .compose-wrap {
        background-color: rgba(16, 16, 20, 0.75);
    }
}
</style>