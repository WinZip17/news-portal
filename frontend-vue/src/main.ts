import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import store from '@/store'
import { key } from '@/store/injectionKey'
import vuetify from './plugins/vuetify'

const app = createApp(App)
app.use(store, key)
app.use(router)
app.use(vuetify)

app.mount('#app')
