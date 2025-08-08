import { LoginForm } from '@/features/auth/ui/login-form'
import { Link } from 'react-router-dom'

export const LoginPage = () => {
  return (
    <div className="mx-auto max-w-md p-6">
      <h2 className="mb-4 text-xl font-semibold">Sign in</h2>
      <LoginForm />
      <div className="mt-4 text-sm">
        Нет аккаунта?{' '}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Зарегистрироваться
        </Link>
      </div>
    </div>
  )
}
