import type { Module } from 'vuex'

import type { RootState } from '../types'
import type { UIState } from './state'

import { state } from './state'
import { getters } from './getters'
import { actions } from './actions'
import { mutations } from './mutations'

export const ui: Module<UIState, RootState> = {
  namespaced: true,

  state,

  getters,

  actions,

  mutations,
}
