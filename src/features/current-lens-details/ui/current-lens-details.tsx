import { MODAL_IDS } from '@/app/store'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import {
  resumeLens,
  selectCurrentLens
} from '@/app/store/slices/lens-management-slice'
import {
  calculateTotalUsageMs,
  getEndOfLocalDay,
  getRemainingDays,
  getRemainingHours,
  isLensExpired
} from '@/app/store/slices/lens-management-slice/selectors'
import { openModal } from '@/app/store/slices/modal-slice/slice'
import {
  DiscardConfirmModal,
  PauseConfirmModal
} from '@/features/lens-action-modals'
import { ContactLensIcon, StopSignIcon } from '@/shared/ui/icons'
import { ProgressBar } from '@/shared/ui/progress-bar'
import { useMemo } from 'react'

export const CurrentLensDetails = () => {
  const dispatch = useAppDispatch()
  const currentLens = useAppSelector(selectCurrentLens)

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
    openedDate,
    status
  } = currentLens

  const totalUsageMs = calculateTotalUsageMs(currentLens)
  const msPerDay = 24 * 60 * 60 * 1000
  let progressPercentage: number
  if (wearPeriodDays === 1) {
    // For daily lenses, reflect hours left until end of local day
    if (isLensExpired(currentLens)) {
      progressPercentage = 100
    } else if (openedDate) {
      const endOfDay = getEndOfLocalDay(new Date(openedDate))
      const remainingMs = Math.max(0, endOfDay.getTime() - Date.now())
      progressPercentage = Math.min(
        Math.max(((msPerDay - remainingMs) / msPerDay) * 100, 0),
        100
      )
    } else {
      progressPercentage = 0
    }
  } else {
    // For multi-day lenses, use total usage time across the entire period
    progressPercentage = Math.min(
      Math.max((totalUsageMs / (wearPeriodDays * msPerDay)) * 100, 0),
      100
    )
  }

  const remainingDays = getRemainingDays(currentLens)

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = isLensExpired(currentLens)

  const startLabelDate = openedDate ? formatDate(new Date(openedDate)) : 'N/A'
  const endLabelDate = openedDate
    ? formatDate(
        new Date(
          new Date(openedDate).getTime() + wearPeriodDays * 24 * 60 * 60 * 1000
        )
      )
    : 'N/A'

  // When remaining time goes under 24 hours, append hours left to the progress bar end label
  const msPerHour = 60 * 60 * 1000
  const remainingHoursForLabel = useMemo(() => {
    if (isExpired) return null
    if (wearPeriodDays === 1) {
      return getRemainingHours(currentLens)
    }
    const totalPeriodMs = wearPeriodDays * msPerDay
    const remainingTotalMs = Math.max(0, totalPeriodMs - totalUsageMs)
    if (remainingTotalMs <= msPerDay) {
      return Math.ceil(remainingTotalMs / msPerHour)
    }
    return null
  }, [
    isExpired,
    wearPeriodDays,
    currentLens,
    msPerDay,
    totalUsageMs,
    msPerHour
  ])
  const endProgressLabel =
    remainingHoursForLabel != null
      ? `${endLabelDate} (${remainingHoursForLabel}ч.)`
      : endLabelDate

  const openTakeOffModal = () =>
    dispatch(openModal(MODAL_IDS.LENS_TAKE_OFF_CONFIRM))
  const openDiscardModal = () =>
    dispatch(openModal(MODAL_IDS.LENS_DISCARD_CONFIRM))

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
            {isExpired ? null : <span className="pr-1">Осталось:</span>}
            <span
              className={`font-medium ${
                isExpired
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {isExpired
                ? 'Истекли'
                : wearPeriodDays === 1
                  ? `${getRemainingHours(currentLens) ?? 'N/A'}ч.`
                  : `${remainingDays ?? 'N/A'}д.`}
            </span>
          </div>
          <ProgressBar
            className="mt-2"
            percentage={progressPercentage}
            startLabel={startLabelDate}
            endLabel={endProgressLabel}
          />

          <div className="mt-4 flex justify-between">
            <button
              onClick={openDiscardModal}
              className="flex items-center gap-2 rounded-lg border-2 border-red-500 px-4 py-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
            >
              <StopSignIcon className="size-5" />
              <span className="font-medium">Утилизировать</span>
            </button>

            {!isExpired && status === 'in-use' && (
              <button
                onClick={openTakeOffModal}
                className="flex items-center rounded-lg border-2 border-blue-500 px-4 py-2 text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
              >
                <span className="font-medium">Снять</span>
              </button>
            )}
            {!isExpired && status === 'taken-off' && (
              <button
                onClick={() => dispatch(resumeLens(currentLens.id))}
                className="flex items-center gap-2 rounded-lg border-2 border-green-500 px-4 py-2 text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300"
              >
                <span className="font-medium">Возобновить</span>
              </button>
            )}
          </div>
        </>
      </div>

      <PauseConfirmModal />
      <DiscardConfirmModal />
    </div>
  )
}
