import type { InjectionKey } from 'vue'
import type { Store } from 'vuex'

import type { RootState } from './types'

export const key: InjectionKey<Store<RootState>> = Symbol('store')
