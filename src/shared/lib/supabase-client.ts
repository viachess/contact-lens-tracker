import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let singletonClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.'
    )
  }
  if (!singletonClient) {
    singletonClient = createClient(
      supabaseUrl as string,
      supabaseAnonKey as string,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'lens-tracker-auth'
        }
      }
    )
  }
  return singletonClient
}
