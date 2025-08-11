import React, { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { selectUser } from '@/app/store/slices/auth-slice/selectors'
import {
  selectTheme,
  selectThemeColors
} from '@/app/store/slices/app-slice/selectors'
import {
  setThemeColors,
  toggleTheme
} from '@/app/store/slices/app-slice/appSlice'
import {
  DEFAULT_THEME_COLORS,
  resetThemeColors
} from '@/app/store/slices/app-slice/appSlice'
import {
  getSupabaseClient,
  isSupabaseConfigured
} from '@/shared/lib/supabaseClient'

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const mode = useAppSelector(selectTheme)
  const themeColors = useAppSelector(selectThemeColors)
  const [localColors, setLocalColors] = useState(themeColors)
  const supabase = useMemo(
    () => (isSupabaseConfigured ? getSupabaseClient() : null),
    []
  )

  const handleColorChange = (key: keyof typeof localColors, value: string) => {
    setLocalColors((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    dispatch(setThemeColors(localColors))
    if (supabase && user?.id) {
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme_colors: localColors,
          updated_at: new Date().toISOString()
        })
        .select()
    } else {
      localStorage.setItem('user_theme_colors', JSON.stringify(localColors))
    }
  }

  const handleReset = async () => {
    dispatch(resetThemeColors())
    setLocalColors(DEFAULT_THEME_COLORS)
    if (supabase && user?.id) {
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme_colors: DEFAULT_THEME_COLORS,
          updated_at: new Date().toISOString()
        })
        .select()
    } else {
      localStorage.setItem(
        'user_theme_colors',
        JSON.stringify(DEFAULT_THEME_COLORS)
      )
    }
  }

  const handleLoad = async () => {
    if (supabase && user?.id) {
      const { data } = await supabase
        .from('user_settings')
        .select('theme_colors')
        .eq('user_id', user.id)
        .single()
      if (
        data?.theme_colors &&
        typeof data.theme_colors === 'object' &&
        typeof (data.theme_colors as any).navbar === 'string'
      ) {
        dispatch(setThemeColors(data.theme_colors as any))
        setLocalColors(data.theme_colors as any)
      }
    } else {
      const raw = localStorage.getItem('user_theme_colors')
      if (raw) {
        const parsed = JSON.parse(raw) as unknown
        if (
          parsed &&
          typeof parsed === 'object' &&
          typeof (parsed as any).navbar === 'string'
        ) {
          dispatch(setThemeColors(parsed as any))
          setLocalColors(parsed as any)
        }
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Профиль</h1>
      <div className="rounded-md border p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
        <p className="text-lg">{user?.email ?? '—'}</p>
      </div>

      <div
        className="mt-8 rounded-md border border-gray-200 bg-[var(--color-surface)] p-4 dark:border-gray-700 dark:bg-gray-800"
        style={{ color: 'var(--color-surface-text)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold dark:text-gray-100">
            Тема приложения
          </h2>
          <button
            onClick={() => dispatch(toggleTheme())}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            {mode === 'dark' ? 'Включить светлую' : 'Включить тёмную'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">
              Цвет навбара
            </label>
            <input
              type="color"
              value={localColors.navbar}
              onChange={(e) => handleColorChange('navbar', e.target.value)}
              className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
            />
            <label className="mt-2 block text-xs text-gray-500 dark:text-gray-400">
              Текст навбара
            </label>
            <input
              type="color"
              value={localColors.navbarText}
              onChange={(e) => handleColorChange('navbarText', e.target.value)}
              className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">
              Фон приложения
            </label>
            <input
              type="color"
              value={localColors.background}
              onChange={(e) => handleColorChange('background', e.target.value)}
              className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">
              Фон элементов
            </label>
            <input
              type="color"
              value={localColors.surface}
              onChange={(e) => handleColorChange('surface', e.target.value)}
              className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
            />
            <label className="mt-2 block text-xs text-gray-500 dark:text-gray-400">
              Текст элементов
            </label>
            <input
              type="color"
              value={localColors.surfaceText}
              onChange={(e) => handleColorChange('surfaceText', e.target.value)}
              className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">
              Кнопки — основной
            </label>
            <input
              type="color"
              value={localColors.buttonPrimary}
              onChange={(e) =>
                handleColorChange('buttonPrimary', e.target.value)
              }
              className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
            />
            <label className="mt-2 block text-xs text-gray-500 dark:text-gray-400">
              Текст — основной
            </label>
            <input
              type="color"
              value={localColors.buttonPrimaryText}
              onChange={(e) =>
                handleColorChange('buttonPrimaryText', e.target.value)
              }
              className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">
              Кнопки — вторичный
            </label>
            <input
              type="color"
              value={localColors.buttonSecondary}
              onChange={(e) =>
                handleColorChange('buttonSecondary', e.target.value)
              }
              className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
            />
            <label className="mt-2 block text-xs text-gray-500 dark:text-gray-400">
              Текст — вторичный
            </label>
            <input
              type="color"
              value={localColors.buttonSecondaryText}
              onChange={(e) =>
                handleColorChange('buttonSecondaryText', e.target.value)
              }
              className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300">
              Кнопки — опасность
            </label>
            <input
              type="color"
              value={localColors.buttonDanger}
              onChange={(e) =>
                handleColorChange('buttonDanger', e.target.value)
              }
              className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
            />
            <label className="mt-2 block text-xs text-gray-500 dark:text-gray-400">
              Текст — опасность
            </label>
            <input
              type="color"
              value={localColors.buttonDangerText}
              onChange={(e) =>
                handleColorChange('buttonDangerText', e.target.value)
              }
              className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            className="rounded px-4 py-2 text-sm hover:brightness-95 dark:bg-blue-500 dark:hover:bg-blue-600"
            style={{
              backgroundColor: 'var(--color-button-primary)',
              color: 'var(--color-button-primary-text)'
            }}
          >
            Сохранить тему
          </button>
          <button
            onClick={handleLoad}
            className="rounded px-4 py-2 text-sm hover:brightness-95 dark:bg-gray-500 dark:hover:bg-gray-600"
            style={{
              backgroundColor: 'var(--color-button-secondary)',
              color: 'var(--color-button-secondary-text)'
            }}
          >
            Загрузить сохранённую
          </button>
          <button
            onClick={handleReset}
            className="rounded px-4 py-2 text-sm hover:brightness-95 dark:bg-red-500 dark:hover:bg-red-600"
            style={{
              backgroundColor: 'var(--color-button-danger)',
              color: 'var(--color-button-danger-text)'
            }}
          >
            Сбросить тему
          </button>
        </div>
      </div>
    </div>
  )
}
