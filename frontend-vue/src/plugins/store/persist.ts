import type { Store } from 'vuex'

import { StorageKey } from '@/constants/storage'
import type { RootState } from '@/store/types'
import { loadFromStorage, saveToStorage } from '@utils/storage.ts'
import type { UIState } from '@store/ui/state.ts'

export function createPersistPlugin() {
  return (store: Store<RootState>) => {
    const saved = loadFromStorage<UIState>(StorageKey.UI)

    if (saved) {
      store.commit('ui/setState', saved)
    }
    store.subscribe((mutation, state) => {
      if (mutation.type.startsWith('ui/')) {
        saveToStorage(StorageKey.UI, state.ui)
      }
    })
  }
}
