import { HomePage, DataPage, SettingsPage } from '@/pages'
import { FC } from 'react'

export const routes: {
  title: string
  path: string
  element: FC
}[] = [
  { title: '🏠', path: '/', element: HomePage },
  { title: 'Настройки', path: '/settings', element: SettingsPage },
  { title: 'Данные', path: '/data', element: DataPage }
]
