import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { loginWithEmail } from '@/app/store/slices/auth-slice'
import {
  selectAuthStatus,
  selectAuthError
} from '@/app/store/slices/auth-slice/selectors'
import { isSupabaseConfigured } from '@/shared/lib/supabase-client'

const schema = z.object({
  email: z.email({ message: 'Введите корректный email' }),
  password: z.string().min(1, { message: 'Введите пароль' })
})

type FormValues = z.infer<typeof schema>

export const LoginForm = () => {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectAuthStatus)
  const error = useAppSelector(selectAuthError)
  const navigate = useNavigate()
  const location = useLocation()

  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    if (status === 'authenticated' && !hasRedirectedRef.current) {
      const from = (location.state as { from?: { pathname?: string } } | null)
        ?.from
      let to = from?.pathname
      // Fallback to ?redirect query param
      if (!to) {
        const params = new URLSearchParams(location.search)
        const redirect = params.get('redirect')
        if (redirect) to = redirect
      }
      to = to || '/'
      hasRedirectedRef.current = true
      navigate(to, { replace: true })
    }
  }, [status, navigate, location.state, location.search])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onChange' })

  const onSubmit = (values: FormValues) => {
    dispatch(loginWithEmail({ email: values.email, password: values.password }))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isSupabaseConfigured && (
        <div className="rounded-md border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800">
          Supabase env vars missing. Set VITE_SUPABASE_URL and
          VITE_SUPABASE_ANON_KEY and restart dev server.
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-md border px-3 py-2"
          {...register('email')}
        />
        {errors.email && (
          <div className="text-sm text-red-600">{errors.email.message}</div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">Пароль</label>
        <input
          type="password"
          className="mt-1 w-full rounded-md border px-3 py-2"
          {...register('password')}
        />
        {errors.password && (
          <div className="text-sm text-red-600">{errors.password.message}</div>
        )}
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={!isValid || isSubmitting || status === 'authenticating'}
        >
          {status === 'authenticating' ? (
            <span
              aria-label="loading"
              className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            />
          ) : (
            'Войти'
          )}
        </button>
      </div>
    </form>
  )
}
