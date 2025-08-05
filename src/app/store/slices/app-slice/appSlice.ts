import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AppState {
  isLoading: boolean
  user: {
    name: string
    email: string
  } | null
  theme: 'light' | 'dark'
}

const initialState: AppState = {
  isLoading: false,
  user: null,
  theme: 'light'
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
    }
  }
})

export const { setLoading, setUser, toggleTheme } = appSlice.actions
export const appSliceReducer = appSlice.reducer
