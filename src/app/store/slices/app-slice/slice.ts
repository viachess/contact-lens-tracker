import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from './model/app-state'
import { DEFAULT_THEME_COLORS } from './lib/default-theme-colors'
import { ThemeColors } from './model/theme-colors'

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
