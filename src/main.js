import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createI18n } from 'vue-i18n';

import ar from './locale/ar.json';

const i18n = createI18n({
  legacy: false,
  locale: 'ar',   
  fallbackLocale: 'ar',
  messages: { ar }
});

const app = createApp(App);
app.use(i18n);
app.mount('#app');