import { useState } from 'react'
import cn from 'classnames'
import { Link } from 'react-router-dom'
import { toggleTheme as toggleThemeAction } from '@/app/store/slices/app-slice/appSlice'
import { selectTheme } from '@/app/store/slices/app-slice/selectors'
import { routes } from '@/app/constants'
import { useAppSelector, useAppDispatch } from '@/app/store/hooks'
import { selectUser } from '@/app/store/slices/auth-slice/selectors'
import { logout } from '@/app/store/slices/auth-slice'
import { ProfileIcon } from '@/shared/ui/icons'

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const theme = useAppSelector(selectTheme)
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)

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
    <nav className="fixed inset-x-0 top-0 z-50 shadow-md bg-[var(--color-navbar)] text-[var(--color-navbar-text)] dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Desktop Navigation - Left side with Logo */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-xl font-bold hover:opacity-80">
              Lens Tracker
            </Link>
            {user && (
              <div className="flex items-baseline space-x-4">
                {routes.map((item) => (
                  <Link
                    key={item.title}
                    to={item.path}
                    className="rounded-md px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle button - Desktop */}
            <div className="hidden md:block">
              <button
                onClick={handleToggleTheme}
                className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium shadow-sm transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:opacity-80"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
            {/* Profile button - Desktop (left of Login/Logout) */}
            {user && (
              <div className="hidden md:block">
                <Link
                  to="/profile"
                  className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                >
                  <ProfileIcon className="size-5 dark:text-gray-300 dark:fill-gray-300" />
                </Link>
              </div>
            )}
            <div className="hidden md:block">
              {user ? (
                <button
                  onClick={() => dispatch(logout())}
                  className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                >
                  Выйти
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                >
                  Войти
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button and logo */}
          <div className="md:hidden flex justify-between items-center w-full">
            <Link
              to="/"
              className="text-lg font-bold hover:opacity-80 justify-self-start"
            >
              Lens Tracker
            </Link>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
      <div className={cn(isMenuOpen ? 'block' : 'hidden', 'md:hidden')}>
        <div className="space-y-1 border-t border-gray-200 px-2 pb-3 pt-2 sm:px-3 dark:border-gray-700 text-left">
          {user &&
            routes.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className="block rounded-md px-3 py-2 text-base font-medium transition-opacity hover:opacity-80 text-left"
                onClick={closeMenu}
              >
                {item.title}
              </Link>
            ))}

          {/* Theme toggle button - Mobile */}
          <button
            onClick={handleToggleTheme}
            className="block w-full rounded-md px-3 py-2 text-base font-medium transition-opacity hover:opacity-80 text-left"
          >
            {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
          {user && (
            <Link
              to="/profile"
              onClick={closeMenu}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium transition-opacity hover:opacity-80 text-left"
            >
              <ProfileIcon className="size-5 dark:text-gray-300" />
              Профиль
            </Link>
          )}
          {user && (
            <button
              onClick={() => {
                dispatch(logout())
                closeMenu()
              }}
              className="block w-full rounded-md px-3 py-2 text-base font-medium transition-opacity hover:opacity-80 text-left"
            >
              Выйти
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
