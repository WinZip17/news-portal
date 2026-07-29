import { computed } from 'vue'

import { ThemeName } from '@/constants/theme'
import { useStore } from '@/store/useStore'

export function useTheme() {
  const store = useStore()

  const theme = computed(() => store.state.ui.theme)

  const isDarkTheme = computed(
    () => theme.value === ThemeName.Dark,
  )

  function setTheme(theme: ThemeName) {
    store.dispatch('ui/changeTheme', theme)
  }

  function toggleTheme() {
    setTheme(
      isDarkTheme.value
        ? ThemeName.Light
        : ThemeName.Dark,
    )
  }

  return {
    theme,
    isDarkTheme,
    setTheme,
    toggleTheme,
  }
}
