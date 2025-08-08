import { SignUpForm } from '@/features/auth/ui/signup-form'
import { Link } from 'react-router-dom'

export const SignUpPage = () => {
  return (
    <div className="mx-auto max-w-md p-6">
      <h2 className="mb-4 text-xl font-semibold">Регистрация</h2>
      <SignUpForm />
      <div className="mt-4 text-sm">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Войти
        </Link>
      </div>
    </div>
  )
}
