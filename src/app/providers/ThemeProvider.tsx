import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import {
  selectTheme,
  selectThemeColors
} from '../store/slices/app-slice/selectors'
import { selectUser } from '@/app/store/slices/auth-slice/selectors'
import {
  setThemeColors,
  setTheme,
  DEFAULT_THEME_COLORS
} from '@/app/store/slices/app-slice/appSlice'
import {
  getSupabaseClient,
  isSupabaseConfigured
} from '@/shared/lib/supabaseClient'
import '@/app/theme.css'

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)
  const colors = useAppSelector(selectThemeColors)
  const user = useAppSelector(selectUser)

  const isThemeColors = (
    value: unknown
  ): value is ReturnType<typeof selectThemeColors> => {
    if (!value || typeof value !== 'object') return false
    const v = value as Record<string, unknown>
    return (
      typeof v.navbar === 'string' &&
      typeof v.background === 'string' &&
      typeof v.surface === 'string' &&
      typeof v.buttonPrimary === 'string' &&
      typeof v.buttonSecondary === 'string' &&
      typeof v.buttonDanger === 'string'
    )
  }

  useEffect(() => {
    const htmlElement = document.documentElement

    if (theme === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-navbar', colors.navbar)
    root.style.setProperty('--color-navbar-text', colors.navbarText)
    root.style.setProperty('--color-background', colors.background)
    root.style.setProperty('--color-surface', colors.surface)
    root.style.setProperty('--color-surface-text', colors.surfaceText)
    root.style.setProperty('--color-button-primary', colors.buttonPrimary)
    root.style.setProperty(
      '--color-button-primary-text',
      colors.buttonPrimaryText
    )
    root.style.setProperty('--color-button-secondary', colors.buttonSecondary)
    root.style.setProperty(
      '--color-button-secondary-text',
      colors.buttonSecondaryText
    )
    root.style.setProperty('--color-button-danger', colors.buttonDanger)
    root.style.setProperty(
      '--color-button-danger-text',
      colors.buttonDangerText
    )

    // Persist locally for quick restore
    try {
      localStorage.setItem('user_theme_colors', JSON.stringify(colors))
    } catch {}
  }, [colors])

  // Load or reset theme when auth state changes
  useEffect(() => {
    const load = async () => {
      // If logged in, prefer server-stored theme
      if (isSupabaseConfigured && user?.id) {
        try {
          const supabase = getSupabaseClient()
          const { data } = await supabase
            .from('user_settings')
            .select('theme_colors')
            .eq('user_id', user.id)
            .single()
          if (data?.theme_colors && isThemeColors(data.theme_colors)) {
            dispatch(setThemeColors(data.theme_colors))
            return
          }
        } catch {}
      } else {
        // Logged out: reset to default light theme and clear stored colors
        try {
          localStorage.removeItem('user_theme_colors')
        } catch {}
        dispatch(setTheme('light'))
        dispatch(setThemeColors(DEFAULT_THEME_COLORS))
        return
      }
      // If logged in but no server data, try localStorage fallback
      try {
        const raw = localStorage.getItem('user_theme_colors')
        if (raw) {
          const parsed = JSON.parse(raw) as unknown
          if (isThemeColors(parsed)) {
            dispatch(setThemeColors(parsed))
          }
        }
      } catch {}
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return <>{children}</>
}
