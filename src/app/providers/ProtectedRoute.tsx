import { ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/store/hooks'
import {
  selectAuthStatus,
  selectUser
} from '@/app/store/slices/auth-slice/selectors'

export const ProtectedRoute = ({
  children
}: {
  children: ReactElement
}): ReactElement => {
  const user = useAppSelector(selectUser)
  const status = useAppSelector(selectAuthStatus)
  const location = useLocation()

  if (status === 'authenticating') {
    return <div className="p-6 text-sm text-gray-500">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
