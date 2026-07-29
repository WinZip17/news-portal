import { ThemeName } from '@/constants/theme'

export interface UIState {
  theme: ThemeName
  sidebarOpen: boolean
  loading: boolean
}

export const state: UIState = {
  theme: ThemeName.Light,
  sidebarOpen: true,
  loading: false,
}
