<template>
    <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
        <n-message-provider>
            <n-dialog-provider>
                <div
                    class="app-container"
                    :class="{ dark: theme?.name === 'dark', mobile: !store.state.desktopModelShow }"
                >
                    <app-header />
                    <div has-sider class="main-wrap" position="static" >
                        <!-- 侧边栏 -->
                        <div v-if="store.state.desktopModelShow && route.path !== '/live'">
                            <sidebar />
                        </div>

                        <div class="content-wrap" :class="{ 'live-layout': route.path === '/live' }">
                            <router-view
                                class="app-wrap"
                                v-slot="{ Component }"
                            >
                                <keep-alive>
                                    <component
                                        v-if="$route.meta.keepAlive"
                                        :is="Component"
                                    />
                                </keep-alive>
                                <component
                                    v-if="!$route.meta.keepAlive"
                                    :is="Component"
                                />
                            </router-view>
                        </div>

                        <!-- 右侧 -->
                        <rightbar v-if="route.path !== '/live'" />
                    </div>
                    <!-- 登录/注册公共组件 -->
                    <auth />
                </div>
            </n-dialog-provider>
        </n-message-provider>
        <n-global-style />
    </n-config-provider>
</template>

<script setup lang="ts">
import { getSiteProfile } from '@/api/site';
import AppHeader from '@/components/AppHeader.vue';
import { themeOverrides } from '@/theme';
import { darkTheme } from 'naive-ui';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const route = useRoute();
const theme = computed(() => (store.state.theme === 'dark' ? darkTheme : null));

function loadSiteProfile() {
  store.commit('loadDefaultSiteProfile');
  if (import.meta.env.VITE_USE_WEB_PROFILE.toLowerCase() === 'true') {
    getSiteProfile()
      .then((res) => {
        store.commit('updateSiteProfile', res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

onMounted(() => {
  loadSiteProfile();
});
</script>

<style lang="less">
@import '@/assets/css/main.less';

.content-wrap.live-layout {
  max-width: 100% !important;
}
</style>