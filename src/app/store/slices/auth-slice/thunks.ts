import { createAsyncThunk } from '@reduxjs/toolkit'
import { getSupabaseClient } from '@/shared/lib/supabase-client'
import { AuthUser } from './types'

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
