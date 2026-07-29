import { useStore as baseUseStore } from 'vuex'

import { key } from './injectionKey'

export function useStore() {
  return baseUseStore(key)
}
