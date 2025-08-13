import { ThemeColors } from './theme-colors'

export interface AppState {
  isLoading: boolean
  user: {
    name: string
    email: string
  } | null
  theme: 'light' | 'dark'
  themeColors: ThemeColors
}
