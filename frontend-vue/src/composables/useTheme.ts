import { computed } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'

import { ThemeName } from '@/constants/theme'
import { useStore } from '@/store/useStore'

export function useTheme() {
  const store = useStore()
  const vuetifyTheme = useVuetifyTheme()

  const theme = computed(() => store.state.ui.theme)

  const isDarkTheme = computed(
    () => theme.value === ThemeName.Dark,
  )

  function setTheme(newTheme: ThemeName) {
    store.dispatch('ui/changeTheme', newTheme)

    vuetifyTheme.global.name.value = newTheme
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
