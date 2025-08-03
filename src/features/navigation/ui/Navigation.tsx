import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toggleTheme as toggleThemeAction } from '../../../app/store/appSlice'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectTheme } from '../../../app/store/selectors'

const menuItems = [
  { name: 'Home', path: '/' },
  { name: 'Data', path: '/data' },
  { name: 'Settings', path: '/settings' }
]

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const theme = useAppSelector(selectTheme)
  const dispatch = useAppDispatch()

  const handleToggleTheme = () => {
    dispatch(toggleThemeAction())
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 shadow-md ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Desktop Navigation - Left side */}
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Logo and Theme Toggle - Right side */}
          <div className="flex items-center space-x-4">
            <div className="shrink-0">
              <h1 className="text-xl font-bold">Lens Tracker</h1>
            </div>

            {/* Theme toggle button - Desktop */}
            <div className="hidden md:block">
              <button
                onClick={handleToggleTheme}
                className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  theme === 'dark'
                    ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:hover:bg-gray-700"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} size-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} size-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="space-y-1 border-t border-gray-200 px-2 pb-3 pt-2 sm:px-3 dark:border-gray-700">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={closeMenu}
            >
              {item.name}
            </Link>
          ))}

          {/* Theme toggle button - Mobile */}
          <button
            onClick={handleToggleTheme}
            className="block w-full rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>
    </nav>
  )
}
