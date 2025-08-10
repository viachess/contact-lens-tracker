import { Navigation } from '@/features/navigation'
import { Outlet } from 'react-router-dom'

export const RootLayout = () => {
  return (
    <div
      className={`min-h-screen bg-[rgb(247,248,250)] text-gray-900 dark:bg-gray-900 dark:text-white`}
    >
      <Navigation />
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  )
}
