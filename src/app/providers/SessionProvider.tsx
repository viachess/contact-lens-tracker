import { useEffect } from 'react'
import { useAppDispatch } from '@/app/store/hooks'
import { initSession } from '@/app/store/slices/auth-slice/slice'
import { supabase } from '@/shared/lib/supabaseClient'

export const SessionProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(initSession())
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      dispatch(initSession())
    })
    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [dispatch])

  return <>{children}</>
}
