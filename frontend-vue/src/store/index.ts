import { createStore } from 'vuex'
import { ui } from './ui'

export function createAppStore(plugins = []) {
  return createStore({
    modules: {
      ui
    },
    plugins
  })
}
