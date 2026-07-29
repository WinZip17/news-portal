import type { ActionTree } from 'vuex'

import type { UIState } from './state'
import type { RootState } from '../types'
import { ThemeName } from '@/constants/theme'

export const actions: ActionTree<UIState, RootState> = {
  changeTheme({ commit }, theme: ThemeName) {
    commit('setTheme', theme)
  },
}
