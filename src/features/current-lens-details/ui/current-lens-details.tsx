import { ProgressBar } from '@/shared/ui/progress-bar'
import { ContactLensIcon, StopSignIcon, PauseIcon } from '@/shared/ui/icons'
import { useAppSelector } from '@/app/store/hooks'
import { selectCurrentLensInUse } from '@/app/store/slices/lens-management-slice'

export const CurrentLensDetails = () => {
  const currentLens = useAppSelector(selectCurrentLensInUse)

  if (!currentLens) {
    return (
      <>
        <div>Сейчас не надеты линзы</div>
        <div className="flex items-center gap-2">
          <p className="text-gray-500 dark:text-gray-400">
            Добавьте линзы в настройках
          </p>
          <ContactLensIcon className="size-9 text-gray-400 dark:text-gray-500" />
        </div>
      </>
    )
  }

  const {
    manufacturer,
    brand,
    sphere,
    wearPeriodTitle,
    wearPeriodDays,
    usagePeriodDays,
    openedDate
  } = currentLens

  const progressPercentage = Math.min(
    Math.max((usagePeriodDays / wearPeriodDays) * 100, 0),
    100
  )

  const remainingDays = wearPeriodDays - usagePeriodDays

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = remainingDays <= 0

  const startLabelDate = openedDate ? formatDate(new Date(openedDate)) : 'N/A'
  const endLabelDate = openedDate
    ? formatDate(
        new Date(
          new Date(openedDate).getTime() + usagePeriodDays * 24 * 60 * 60 * 1000
        )
      )
    : 'N/A'

  return (
    <div className="max-w-md">
      <div className="flex flex-col gap-2 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <>
          <div>Сейчас надеты</div>
          <div className="flex items-center gap-2">
            <p>
              {manufacturer} {brand} {sphere} ({wearPeriodTitle})
            </p>
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
            startLabel={startLabelDate}
            endLabel={endLabelDate}
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
        </>
      </div>
    </div>
  )
}
