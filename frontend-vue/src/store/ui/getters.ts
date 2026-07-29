import type { GetterTree } from 'vuex'

import type { UIState } from './state'
import type { RootState } from '../types'

export const getters: GetterTree<UIState, RootState> = {
  currentTheme: (state) => state.theme,

  isDarkTheme: (state) => state.theme === 'dark',

  isLoading: (state) => state.loading,
}
