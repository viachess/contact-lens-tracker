import { Link } from 'react-router-dom'

export const ConfirmEmailPage = () => {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6 text-center">
      <h2 className="mb-3 text-2xl font-semibold">Подтвердите email</h2>
      <p className="mb-6 text-sm text-gray-700 dark:text-gray-300">
        Мы отправили письмо с подтверждением на ваш адрес. Перейдите по ссылке
        из письма, затем вернитесь и войдите в аккаунт.
      </p>
      <Link
        to="/login"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Перейти ко входу
      </Link>
    </div>
  )
}
