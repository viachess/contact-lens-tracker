import { RouterProvider } from 'react-router-dom'
import { router } from './constants'
import { SessionProvider } from './providers/SessionProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { PushProvider } from './providers/PushProvider'

export const App = () => {
  return (
    <ThemeProvider>
      <SessionProvider>
        <PushProvider>
          <RouterProvider router={router} />
        </PushProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
