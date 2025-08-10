import { RouterProvider } from 'react-router-dom'
import { router } from './constants'
import { SessionProvider } from './providers/SessionProvider'
import { ThemeProvider } from './providers/ThemeProvider'

export const App = () => {
  return (
    <ThemeProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </ThemeProvider>
  )
}
