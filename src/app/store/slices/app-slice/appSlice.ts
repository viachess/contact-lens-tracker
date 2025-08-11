import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ThemeColors {
  navbar: string
  background: string
  surface: string
  buttonPrimary: string
  buttonSecondary: string
  buttonDanger: string
  navbarText: string
  surfaceText: string
  buttonPrimaryText: string
  buttonSecondaryText: string
  buttonDangerText: string
}

interface AppState {
  isLoading: boolean
  user: {
    name: string
    email: string
  } | null
  theme: 'light' | 'dark'
  themeColors: ThemeColors
}

export const DEFAULT_THEME_COLORS: ThemeColors = {
  navbar: '#ffffff',
  background: '#f7f8fa',
  surface: '#ffffff',
  buttonPrimary: '#2563eb',
  buttonSecondary: '#6b7280',
  buttonDanger: '#dc2626',
  navbarText: '#111827',
  surfaceText: '#111827',
  buttonPrimaryText: '#ffffff',
  buttonSecondaryText: '#ffffff',
  buttonDangerText: '#ffffff'
}

const initialState: AppState = {
  isLoading: false,
  user: null,
  theme: 'light',
  themeColors: DEFAULT_THEME_COLORS
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setUser: (
      state,
      action: PayloadAction<{ name: string; email: string } | null>
    ) => {
      state.user = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    setThemeColors: (state, action: PayloadAction<ThemeColors>) => {
      state.themeColors = action.payload
    },
    resetThemeColors: (state) => {
      state.themeColors = DEFAULT_THEME_COLORS
    }
  }
})

export const {
  setLoading,
  setUser,
  toggleTheme,
  setTheme,
  setThemeColors,
  resetThemeColors
} = appSlice.actions
export const appSliceReducer = appSlice.reducer
