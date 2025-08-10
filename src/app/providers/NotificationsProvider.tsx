import { useEffect } from 'react'

export function NotificationsProvider({
  children
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Server-side push notifications now handle reminders at 08:00 and 20:00.
    // This provider is kept for potential future client-side notifications.
    return () => {}
  }, [])

  return <>{children}</>
}
