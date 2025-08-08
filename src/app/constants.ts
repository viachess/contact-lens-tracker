import { DataPage, SettingsPage } from '@/pages'
import { FC } from 'react'

export const routes: {
  title: string
  path: string
  element: FC
}[] = [
  { title: 'Линзы', path: '/lenses', element: SettingsPage },
  { title: 'Данные', path: '/data', element: DataPage }
]
