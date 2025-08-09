import React from 'react'
import { useAppSelector } from '@/app/store/hooks'
import { selectUser } from '@/app/store/slices/auth-slice/selectors'

export const ProfilePage: React.FC = () => {
  const user = useAppSelector(selectUser)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Профиль</h1>
      <div className="rounded-md border p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
        <p className="text-lg">{user?.email ?? '—'}</p>
      </div>
    </div>
  )
}
