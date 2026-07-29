import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { key } from '@/store/injectionKey'
import { createAppVuetify } from '@/plugins'
import { createThemeSyncPlugin } from '@/plugins/store/themeSync.ts'
import { createAppStore } from '@/store'
import { createPersistPlugin } from '@/plugins/store/persist.ts'

const vuetify = createAppVuetify()

const store = createAppStore([
  createPersistPlugin(),
  createThemeSyncPlugin(vuetify.theme)
])

const app = createApp(App)

app.use(store, key)
app.use(router)
app.use(vuetify)

app.mount('#app')
