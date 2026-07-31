import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { createAppVuetify } from '@/plugins';
import { setupInterceptors } from '@/api/interceptors';

const vuetify = createAppVuetify();
import { pinia } from './stores';

const app = createApp(App);
setupInterceptors();
app.use(pinia);
app.use(router);
app.use(vuetify);

app.mount('#app');
