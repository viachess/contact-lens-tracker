import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { signupWithEmail } from '@/app/store/slices/auth-slice/slice'
import {
  selectAuthError,
  selectAuthStatus
} from '@/app/store/slices/auth-slice/selectors'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '@/shared/lib/supabaseClient'

const schema = z.object({
  email: z.email({ message: 'Введите корректный email' }),
  password: z.string().min(6, { message: 'Минимум 6 символов' })
})

type FormValues = z.infer<typeof schema>

export const SignUpForm = () => {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectAuthStatus)
  const error = useAppSelector(selectAuthError)
  const [info, setInfo] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  })

  const onSubmit = async (values: FormValues) => {
    setInfo(null)
    try {
      const res = await dispatch(
        signupWithEmail({ email: values.email, password: values.password })
      ).unwrap()
      // Regardless of whether Supabase returns a user or null (email confirmation on),
      // redirect to the confirmation page.
      navigate('/confirm-email')
    } catch (_) {
      setInfo(null)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isSupabaseConfigured && (
        <div className="rounded-md border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800">
          Установите переменные окружения VITE_SUPABASE_URL и
          VITE_SUPABASE_ANON_KEY и перезапустите dev сервер.
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
      {error && (
        <div className="rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-md border border-green-400 bg-green-50 p-3 text-sm text-green-700">
          {info}
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={!isValid || isSubmitting || status === 'authenticating'}
        >
          Зарегистрироваться
        </button>
      </div>
    </form>
  )
}
