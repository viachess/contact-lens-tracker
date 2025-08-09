import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { initSession } from '@/app/store/slices/auth-slice'
import { getSupabaseClient } from '@/shared/lib/supabaseClient'
import { selectUser } from '@/app/store/slices/auth-slice/selectors'
import { fetchLensesForUser } from '@/app/store/slices/lens-management-slice/slice'

export const SessionProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)

  useEffect(() => {
    dispatch(initSession())
    const supabase = getSupabaseClient()
    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      dispatch(initSession())
    })
    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [dispatch])

  // Load lenses when user session is available
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchLensesForUser({ userId: user.id }))
    }
  }, [user?.id, dispatch])

  return <>{children}</>
}
