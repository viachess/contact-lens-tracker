import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getSupabaseClient } from '@/shared/lib/supabase-client'

export interface AuthUser {
  id: string
  email: string | null
}

interface AuthState {
  user: AuthUser | null
  status: 'idle' | 'authenticating' | 'authenticated' | 'error'
  error: string | null
}

const initialState: AuthState = {
  user: null,
  status: 'authenticating',
  error: null
}

export const initSession = createAsyncThunk<
  AuthUser | null,
  void,
  { rejectValue: string }
>('auth/initSession', async (_, { rejectWithValue }) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) return rejectWithValue(error.message)
  const { session } = data
  if (!session?.user) return null
  return { id: session.user.id, email: session.user.email ?? null }
})

export const loginWithEmail = createAsyncThunk<
  AuthUser | null,
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginWithEmail', async ({ email, password }, { rejectWithValue }) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) return rejectWithValue(error.message)
  const { user } = data
  return user ? { id: user.id, email: user.email ?? null } : null
})

export const signupWithEmail = createAsyncThunk<
  AuthUser | null,
  { email: string; password: string },
  { rejectValue: string }
>('auth/signupWithEmail', async ({ email, password }, { rejectWithValue }) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return rejectWithValue(error.message)
  const { user } = data
  return user ? { id: user.id, email: user.email ?? null } : null
})

export const logout = createAsyncThunk<true, void, { rejectValue: string }>(
  'auth/logout',
  async () => {
    const supabase = getSupabaseClient()
    // Perform only a local sign-out in the browser to avoid server 401/403 noise
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      console.error('Failed to sign out locally:', error)
    }
    return true as const
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initSession.pending, (state) => {
        state.status = 'authenticating'
        state.error = null
      })
      .addCase(initSession.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = action.payload ? 'authenticated' : 'idle'
      })
      .addCase(initSession.rejected, (state, action) => {
        state.status = 'error'
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to init session'
      })
      .addCase(loginWithEmail.pending, (state) => {
        state.status = 'authenticating'
        state.error = null
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = action.payload ? 'authenticated' : 'idle'
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.status = 'error'
        state.error =
          (action.payload as string) || action.error.message || 'Login failed'
      })
      .addCase(signupWithEmail.pending, (state) => {
        state.status = 'authenticating'
        state.error = null
      })
      .addCase(signupWithEmail.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = action.payload ? 'authenticated' : 'idle'
      })
      .addCase(signupWithEmail.rejected, (state, action) => {
        state.status = 'error'
        state.error =
          (action.payload as string) || action.error.message || 'Signup failed'
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.status = 'idle'
      })
      .addCase(logout.rejected, (state, action) => {
        state.error =
          (action.payload as string) || action.error.message || 'Logout failed'
      })
  }
})

export const authSliceReducer = authSlice.reducer
