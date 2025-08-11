import type { RootState } from '@/app/store/types'

export const selectApp = (state: RootState) => state.app
export const selectIsLoading = (state: RootState) => state.app.isLoading
export const selectUser = (state: RootState) => state.app.user
export const selectTheme = (state: RootState) => state.app.theme
export const selectThemeColors = (state: RootState) => state.app.themeColors
