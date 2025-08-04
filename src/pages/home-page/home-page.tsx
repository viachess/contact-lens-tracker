import { ProgressBar } from '@/shared/ui/progress-bar'
import { ContactLensIcon, StopSignIcon, PauseIcon } from '@/shared/ui/icons'

export const HomePage = () => {
  // Mock data - in a real app this would come from state management
  const currentDate = new Date()
  const lensDuration = 14 // 14 days lens wear period
  const halfDuration = lensDuration / 2

  const lensStartDate = new Date(
    currentDate.getTime() - halfDuration * 24 * 60 * 60 * 1000
  )
  const lensEndDate = new Date(
    currentDate.getTime() + halfDuration * 24 * 60 * 60 * 1000
  )

  const totalDuration = lensEndDate.getTime() - lensStartDate.getTime()
  const elapsedTime = currentDate.getTime() - lensStartDate.getTime()
  const remainingTime = lensEndDate.getTime() - currentDate.getTime()

  const progressPercentage = Math.min(
    Math.max((elapsedTime / totalDuration) * 100, 0),
    100
  )

  const remainingDays = Math.floor(remainingTime / (1000 * 60 * 60 * 24))

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = remainingTime <= 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md">
        <div className="flex flex-col gap-2 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
          <div>Сейчас надеты</div>
          <div className="flex items-center gap-2">
            <p>Acuvue TruEye -4.5 (Ежедневные)</p>
            <ContactLensIcon className="size-9 text-gray-500 dark:text-gray-300" />
          </div>
          <div>
            <span>Осталось:</span>{' '}
            <span
              className={`font-medium ${
                isExpired
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {isExpired ? 'Expired' : `${remainingDays}д.`}
            </span>
          </div>
          <ProgressBar
            className="mt-2"
            percentage={progressPercentage}
            startLabel={formatDate(lensStartDate)}
            endLabel={formatDate(lensEndDate)}
          />

          <div className="mt-4 flex justify-between">
            <button className="flex items-center gap-2 rounded-lg border-2 border-red-500 px-4 py-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300">
              <StopSignIcon className="size-5" />
              <span className="font-medium">Утилизировать</span>
            </button>

            {!isExpired && (
              <button className="flex items-center gap-2 rounded-lg border-2 border-blue-500 px-4 py-2 text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300">
                <PauseIcon className="size-5" />
                <span className="font-medium">Пауза</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
