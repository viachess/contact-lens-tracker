import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navigation } from '../features/navigation'
import { ThemeProvider } from './providers/ThemeProvider'
import { routes } from './constants'

export const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <div
          className={`min-h-screen bg-[rgb(247,248,250)] text-gray-900 dark:bg-gray-900 dark:text-white`}
        >
          <Navigation />
          <div className="pt-16">
            <Routes>
              {routes.map((route) => {
                return (
                  <Route
                    key={route.title}
                    path={route.path}
                    element={<route.element />}
                  />
                )
              })}
            </Routes>
          </div>
        </div>
      </ThemeProvider>
    </Router>
  )
}
