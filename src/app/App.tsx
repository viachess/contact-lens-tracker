import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Navigation } from '../features/navigation'
import { ThemeProvider } from './providers/ThemeProvider'
import { SessionProvider } from './providers/SessionProvider'
import { ProtectedRoute } from './providers/ProtectedRoute'
import {
  HomePage,
  LoginPage,
  SignUpPage,
  ConfirmEmailPage,
  ProfilePage
} from '@/pages'
import { routes } from './constants'

export const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <SessionProvider>
          <div
            className={`min-h-screen bg-[rgb(247,248,250)] text-gray-900 dark:bg-gray-900 dark:text-white`}
          >
            <Navigation />
            <div className="pt-16">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/confirm-email" element={<ConfirmEmailPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                {routes.map((route) => {
                  return (
                    <Route
                      key={route.title}
                      path={route.path}
                      element={
                        <ProtectedRoute>
                          <route.element />
                        </ProtectedRoute>
                      }
                    />
                  )
                })}
              </Routes>
            </div>
          </div>
        </SessionProvider>
      </ThemeProvider>
    </Router>
  )
}
