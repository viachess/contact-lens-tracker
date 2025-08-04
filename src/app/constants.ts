import { HomePage, DataPage, SettingsPage } from '@/pages'
import { FC } from 'react'

export const routes: {
  title: string
  path: string
  element: FC
}[] = [
  { title: 'Home', path: '/', element: HomePage },
  { title: 'Data', path: '/data', element: DataPage },
  { title: 'Settings', path: '/settings', element: SettingsPage }
]
