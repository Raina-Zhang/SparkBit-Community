<template>
    <div class="header-wrap">
        <!-- 左侧: SparkBit 标题 -->
        <div class="left-section">
            <div class="logo-txt" @click="goHome">SparkBit</div>
        </div>

        <!-- 中间: 菜单 -->
        <div class="center-section">
            <div class="menu-item">行情</div>
            <div class="menu-item">现货</div>
            <div class="menu-item">合约交易</div>
            <div class="menu-item">快速交割</div>
            <n-dropdown :options="communityOptions" trigger="hover" @select="handleSelect">
                <div class="menu-item">
                    SparkBit社区
                    <n-icon :component="ChevronDown" class="arrow-icon" />
                </div>
            </n-dropdown>
        </div>

        <!-- 右侧: 用户信息和模式切换 -->
        <div class="right-section">
             <!-- 模式切换 -->
            <n-switch
                :value="store.state.theme === 'dark'"
                @update:value="switchTheme"
                size="medium"
                class="theme-switch"
            >
                <template #checked-icon>
                    <n-icon :component="DarkModeOutlined" />
                </template>
                <template #unchecked-icon>
                    <n-icon :component="LightModeOutlined" />
                </template>
            </n-switch>

            <!-- 用户信息 -->
             <div class="user-wrap" v-if="store.state.userInfo.id > 0">
                <n-avatar
                    class="user-avatar"
                    round
                    :size="34"
                    :src="store.state.userInfo.avatar"
                />
                <div class="user-info">
                    <div class="nickname">
                        <span class="nickname-txt">
                            {{ store.state.userInfo.nickname }}
                        </span>
                    </div>
                </div>
            </div>
             <div class="user-wrap" v-else>
                <n-button strong secondary round type="primary" @click="triggerAuth('signin')">
                    登录
                </n-button>
                <n-button strong secondary round type="info" @click="triggerAuth('signup')" style="margin-left: 8px">
                    注册
                </n-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ChevronDown, LogOutOutline } from '@vicons/ionicons5';
import { DarkModeOutlined, LightModeOutlined } from '@vicons/material';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const router = useRouter();

const communityOptions = [
  {
    label: 'SparkBit广场',
    key: 'square',
  },
  {
    label: '直播',
    key: 'live',
  },
];

const handleSelect = (key: string) => {
  if (key === 'square') {
    router.push('/');
  } else if (key === 'live') {
    router.push('/live');
  }
};

const goHome = () => {
  router.push('/');
};

const handleLogout = () => {
  store.commit('userLogout');
  window.$message.success('退出成功');
  router.push('/');
};

const triggerAuth = (key: string) => {
  store.commit('triggerAuth', true);
  store.commit('triggerAuthKey', key);
};

const switchTheme = (theme: boolean) => {
  if (theme) {
    localStorage.setItem('PAOPAO_THEME', 'dark');
    store.commit('triggerTheme', 'dark');
  } else {
    localStorage.setItem('PAOPAO_THEME', 'light');
    store.commit('triggerTheme', 'light');
  }
};
</script>

<style lang="less" scoped>
.header-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    padding: 0 24px;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 1000;

    .left-section {
        .logo-txt {
            font-size: 24px;
            font-weight: bold;
            color: var(--primary-color);
            cursor: pointer;
            font-family: "PingFang SC";
        }
    }

    .center-section {
        display: flex;
        gap: 32px;
        
        .menu-item {
            font-size: 16px;
            color: #666;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            align-items: center;
            
            &:hover {
                color: var(--primary-color);
            }

            .arrow-icon {
                margin-left: 4px;
                font-size: 14px;
                transition: transform 0.3s;
            }

            &:hover .arrow-icon {
                transform: rotate(180deg);
            }
        }
    }

    .right-section {
        display: flex;
        align-items: center;
        gap: 16px;

        .theme-switch {
            margin-right: 16px;
        }

        .user-wrap {
            display: flex;
            align-items: center;
            
            .user-avatar {
                margin-right: 12px;
            }

            .user-info {
                display: flex;
                flex-direction: column;
                
                .nickname {
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    font-weight: 500;
                    
                    .nickname-txt {
                        max-width: 100px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .logout {
                        margin-left: 4px;
                    }
                }

                .username {
                    font-size: 12px;
                    color: #999;
                }
            }
        }
    }
}

.dark {
    .header-wrap {
        background: #18181c;
        border-bottom: 1px solid rgba(255, 255, 255, 0.09);

        .center-section .menu-item {
            color: rgba(255, 255, 255, 0.82);
            &:hover {
                color: var(--primary-color);
            }
        }
    }
}
</style>
