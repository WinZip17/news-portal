import type { MutationTree } from 'vuex'

import type { UIState } from './state'
import { ThemeName } from '@/constants/theme'

export const mutations: MutationTree<UIState> = {
  setTheme(state, theme: ThemeName) {
    state.theme = theme
  },

  toggleSidebar(state) {
    state.sidebarOpen = !state.sidebarOpen
  },

  setLoading(state, loading: boolean) {
    state.loading = loading
  },
}
