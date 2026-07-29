import type { Store } from 'vuex'
import type { ThemeInstance } from 'vuetify'
import type { RootState } from '@store/types.ts'

export function createThemeSyncPlugin(theme: ThemeInstance) {
  return (store: Store<RootState>) => {
    // Применяем тему при старте приложения
    theme.global.name.value = store.state.ui.theme
    // Подписываемся на все мутации
    store.subscribe((mutation, state) => {
      if (mutation.type === 'ui/setTheme') {
        theme.global.name.value = state.ui.theme
      }
    })
  }
}
