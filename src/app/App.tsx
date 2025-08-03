import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navigation } from '../features/navigation'
import { ThemeProvider } from './components/ThemeProvider'
import { HomePage } from '../pages/HomePage'
import { DataPage } from '../pages/DataPage'
import { SettingsPage } from '../pages/SettingsPage'

export const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <div
          className={`min-h-screen bg-[rgb(247,248,250)] text-gray-900 dark:bg-gray-900 dark:text-white`}
        >
          <Navigation />

          {/* Main content with top padding to account for fixed navigation */}
          <div className="pt-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/data" element={<DataPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      </ThemeProvider>
    </Router>
  )
}
