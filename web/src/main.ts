import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import type { MessageApiInjection } from 'naive-ui/lib/message/src/MessageProvider';

// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';

// Force mock token for demo
if (!localStorage.getItem('PAOPAO_TOKEN')) {
  localStorage.setItem('PAOPAO_TOKEN', 'mock-token-demo-mode-only');
}

createApp(App).use(router).use(store).mount('#app');

declare global {
  interface Window {
    $message: MessageApiInjection;
    $store: any;
  }
}
