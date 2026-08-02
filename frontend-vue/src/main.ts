import { createApp } from 'vue';
import { createHead } from '@unhead/vue/client';
import App from './App.vue';
import router from './router';
import { createAppVuetify } from '@/plugins';
import { setupInterceptors } from '@/api/interceptors';
import '@/assets/main.css';
import '@/assets/utilities.css';
import { pinia } from './stores';

const vuetify = createAppVuetify();
const head = createHead();
const app = createApp(App);
setupInterceptors();
app.use(head);
app.use(pinia);
app.use(router);
app.use(vuetify);

app.mount('#app');
