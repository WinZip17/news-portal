import { createApp } from 'vue';
import { createHead } from '@unhead/vue/client';
import App from './App.vue';
import router from './router';
import { createAppVuetify } from '@/plugins';
import { setupInterceptors } from '@/api/interceptors';
import '@/assets/main.css';
import '@/assets/utilities.css';
import { pinia } from './stores';
import { initYandexMetrika } from '@/plugins/yandexMetrika';

const vuetify = createAppVuetify();
const head = createHead();
const app = createApp(App);
setupInterceptors();
app.use(head);
app.use(pinia);
app.use(router);
app.use(vuetify);

initYandexMetrika();

app.mount('#app');
