import { useEffect } from 'react'
import { useAppSelector } from '@/app/store/hooks'
import { selectTheme } from '../store/selectors'

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useAppSelector(selectTheme)

  useEffect(() => {
    const htmlElement = document.documentElement

    if (theme === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }, [theme])

  return <>{children}</>
}
