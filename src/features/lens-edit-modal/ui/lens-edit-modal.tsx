import { MODAL_IDS } from '@/app/store'
import { EditIcon, TrashIcon } from '@/shared/ui/icons'
import { ModalContainer } from '@/shared/ui/portal-modal'
import { useMemo, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import {
  getRemainingDays,
  isLensExpired,
  Lens
} from '@/app/store/slices/lens-management-slice'
import { lensTypeToWearPeriodMap } from '@/app/store/slices/lens-management-slice'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import {
  swapCurrentLensForUser,
  takeOffCurrentLensForUser
} from '@/app/store/slices/lens-management-slice'
import {
  MANUFACTURER_BRANDS_MAP,
  inferWearPeriodTitleForBrand,
  BrandWithWearPeriod
} from '@/shared/constants/lens-manufacturers'
import { selectUser } from '@/app/store/slices/auth-slice'
import { parseDate } from '@/shared/lib'
// import {
//   isLensExpired,
//   getRemainingDays,
//   parseDate
// } from '@/app/store/slices/lens-management-slice/selectors'

interface LensEditModalProps {
  lens: Lens | null
  onClose: () => void
  onEdit: (lens: Lens) => void
  onDelete: (lens: Lens) => void
}

const formatDate = (date: Date | null) => {
  if (!date) return 'N/A'
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in-use':
      return 'text-green-600 dark:text-green-400'
    case 'opened':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'taken-off':
      return 'text-blue-600 dark:text-blue-400'
    case 'unopened':
      return 'text-gray-600 dark:text-gray-400'
    case 'expired':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'in-use':
      return 'В использовании'
    case 'opened':
      return 'Открыты'
    case 'taken-off':
      return 'Сняты'
    case 'unopened':
      return 'Не открыты'
    case 'expired':
      return 'Истекли'
    default:
      return 'Неизвестно'
  }
}

export const LensEditModal = ({
  lens,
  onClose,
  onEdit,
  onDelete
}: LensEditModalProps) => {
  const dispatch = useAppDispatch()
  const currentLens = useAppSelector(
    (state) => state.lensManagement.currentLens
  )
  const user = useAppSelector(selectUser)
  const manufacturerToBrands = useMemo(() => {
    const map = new Map<string, Set<string>>()
    Object.entries(MANUFACTURER_BRANDS_MAP).forEach(([m, brands]) => {
      const names = (brands as BrandWithWearPeriod[]).map((b) => b.name)
      map.set(m, new Set(names))
    })
    return map
  }, [])
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Lens | null>(null)
  const [usageError, setUsageError] = useState<string | null>(null)

  const setWearPeriodByTitle = (title: string) => {
    const days =
      lensTypeToWearPeriodMap[title as keyof typeof lensTypeToWearPeriodMap]
    setEditData((prev) =>
      prev ? { ...prev, wearPeriodTitle: title, wearPeriodDays: days } : null
    )
  }

  const manufacturerOptions = useMemo(() => {
    return Array.from(manufacturerToBrands.keys())
      .sort()
      .map((v) => ({ value: v, label: v }))
  }, [manufacturerToBrands])
  const brandOptions = useMemo(() => {
    const currentManufacturer = (editData?.manufacturer || '').trim()
    const brands = currentManufacturer
      ? manufacturerToBrands.get(currentManufacturer)
      : undefined
    return brands
      ? Array.from(brands)
          .sort()
          .map((v) => ({ value: v, label: v }))
      : []
  }, [manufacturerToBrands, editData?.manufacturer])

  if (!lens) return null

  const handleEdit = () => {
    setEditData({ ...lens })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editData) {
      const up = editData.usagePeriodDays
      const isUsageValid = Number.isFinite(up) && up >= 0 && up <= 365
      if (!isUsageValid) {
        setUsageError('Введите число от 0 до 365')
        return
      }
      onEdit(editData)
      setIsEditing(false)
      setEditData(null)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(null)
  }

  const handleDelete = () => {
    onDelete(lens)
  }

  const handleSwapLens = () => {
    if (!user?.id) return
    dispatch(swapCurrentLensForUser({ userId: user.id, lensId: lens.id }))
    onClose()
  }

  // No confirmation in edit modal: take off or put on directly

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const discardDate = lens.discardDate ? parseDate(lens.discardDate) : null
  const remainingDays = getRemainingDays(lens)
  const isExpired = isLensExpired(lens)
  const canSwap =
    !isExpired && lens.status !== 'in-use' && currentLens?.id !== lens.id
  const canTakeOff =
    !isExpired && lens.status === 'in-use' && currentLens?.id === lens.id

  return (
    <ModalContainer name={MODAL_IDS.LENS_EDIT}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
        onClick={handleBackgroundClick}
      >
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-gradient-to-br from-white to-gray-50 p-4 shadow-2xl sm:p-8 dark:from-gray-800 dark:to-gray-900">
          {/* Header with gradient background */}
          <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white sm:mb-8 sm:p-6">
            <div className="flex flex-wrap items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold sm:text-2xl">
                  {isEditing ? 'Редактировать линзу' : 'Информация о линзе'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="ml-4 shrink-0 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <svg
                  className="size-5 sm:size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 font-semibold text-white transition-all hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 sm:px-6"
                  >
                    Сохранить изменения
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditData({ ...lens })
                      setUsageError(null)
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-4 py-3 font-semibold text-white transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 sm:px-6"
                  >
                    Сбросить
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-4 py-3 font-semibold text-white transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 sm:px-6"
                  >
                    Отменить
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-3 font-semibold text-white transition-all hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 sm:px-6"
                  >
                    <EditIcon className="size-5" />
                    <span className="hidden sm:inline">Редактировать</span>
                    <span className="sm:hidden">Изменить</span>
                  </button>
                  {(canSwap || canTakeOff) && (
                    <button
                      onClick={() => {
                        if (!user?.id) return
                        if (canTakeOff) {
                          dispatch(
                            takeOffCurrentLensForUser({ userId: user.id })
                          )
                          onClose()
                        } else {
                          handleSwapLens()
                        }
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-3 font-semibold text-white transition-all hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 sm:px-6"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            canTakeOff
                              ? 'M6 18L18 6M6 6l12 12'
                              : 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
                          }
                        />
                      </svg>
                      <span>{canTakeOff ? 'Снять' : 'Надеть'}</span>
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/20 px-4 py-3 font-semibold text-white transition-all hover:bg-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 sm:px-6"
                  >
                    <TrashIcon className="size-5" />
                    <span className="hidden sm:inline">Удалить</span>
                    <span className="sm:hidden">Удалить</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content Cards */}
          <div className="space-y-4 sm:space-y-6">
            {/* Main Info Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                Основная информация
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Производитель
                  </label>
                  {isEditing ? (
                    <div className="mt-2 w-full">
                      <CreatableSelect
                        className="w-full"
                        classNamePrefix="rs"
                        placeholder="Выберите или введите..."
                        options={manufacturerOptions}
                        value={
                          editData?.manufacturer
                            ? {
                                value: editData.manufacturer,
                                label: editData.manufacturer
                              }
                            : null
                        }
                        onChange={(opt: any) =>
                          setEditData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  manufacturer: opt?.value || '',
                                  brand: ''
                                }
                              : null
                          )
                        }
                        isClearable
                      />
                    </div>
                  ) : (
                    <p className="mt-2 text-base font-medium text-gray-900 sm:text-lg dark:text-white">
                      {lens.manufacturer}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Бренд
                  </label>
                  {isEditing ? (
                    <div className="mt-2 w-full">
                      <CreatableSelect
                        className="w-full"
                        classNamePrefix="rs"
                        placeholder="Выберите или введите..."
                        options={brandOptions}
                        value={
                          editData?.brand
                            ? { value: editData.brand, label: editData.brand }
                            : null
                        }
                        onChange={(opt: any) =>
                          setEditData((prev) => {
                            if (!prev) return null
                            const nextBrand = opt?.value || ''
                            const inferred =
                              inferWearPeriodTitleForBrand(nextBrand)
                            if (inferred) {
                              const days =
                                lensTypeToWearPeriodMap[
                                  inferred as keyof typeof lensTypeToWearPeriodMap
                                ]
                              return {
                                ...prev,
                                brand: nextBrand,
                                wearPeriodTitle: inferred,
                                wearPeriodDays: days
                              }
                            }
                            return { ...prev, brand: nextBrand }
                          })
                        }
                        isClearable
                      />
                    </div>
                  ) : (
                    <p className="mt-2 text-base font-medium text-gray-900 sm:text-lg dark:text-white">
                      {lens.brand}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Сфера
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData?.sphere || ''}
                      onChange={(e) =>
                        setEditData((prev) =>
                          prev ? { ...prev, sphere: e.target.value } : null
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="mt-2 text-base font-medium text-gray-900 sm:text-lg dark:text-white">
                      {lens.sphere}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Радиус Кривизны
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData?.baseCurveRadius || ''}
                      onChange={(e) =>
                        setEditData((prev) =>
                          prev
                            ? { ...prev, baseCurveRadius: e.target.value }
                            : null
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="mt-2 text-base font-medium text-gray-900 sm:text-lg dark:text-white">
                      {lens.baseCurveRadius}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Тип линз
                  </label>
                  {isEditing ? (
                    <select
                      value={editData?.wearPeriodTitle || ''}
                      onChange={(e) => setWearPeriodByTitle(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Ежедневные">Ежедневные</option>
                      <option value="Двухнедельные">Двухнедельные</option>
                      <option value="Ежемесячные">Ежемесячные</option>
                    </select>
                  ) : (
                    <div className="mt-2">
                      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {lens.wearPeriodTitle}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Период использования
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="number"
                        value={editData?.usagePeriodDays ?? 0}
                        onChange={(e) => {
                          const v = e.target.value
                          const parsed = v === '' ? 0 : Number(v)
                          setEditData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  usagePeriodDays: Number.isFinite(parsed)
                                    ? Math.max(0, parsed)
                                    : 0
                                }
                              : null
                          )
                          if (usageError) setUsageError(null)
                        }}
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        min="0"
                        max="365"
                      />
                      {usageError ? (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {usageError}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-2 text-base font-medium text-gray-900 sm:text-lg dark:text-white">
                      {lens.usagePeriodDays} д.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                Статус и даты
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Текущий статус
                  </label>
                  {isEditing ? (
                    <select
                      value={editData?.status || ''}
                      onChange={(e) =>
                        setEditData((prev) => {
                          if (!prev) return null
                          const next = e.target.value as Lens['status']
                          return {
                            ...prev,
                            status: next,
                            openedDate:
                              next === 'unopened' ? null : prev.openedDate
                          }
                        })
                      }
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="unopened">Не открыты</option>
                      <option value="opened">Открыты</option>
                      <option value="in-use">В использовании</option>
                      <option value="taken-off">Сняты</option>
                      <option value="expired">Истекли</option>
                    </select>
                  ) : (
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className={`size-3 rounded-full ${
                          lens.status === 'in-use'
                            ? 'bg-green-500'
                            : lens.status === 'opened'
                              ? 'bg-yellow-500'
                              : lens.status === 'taken-off'
                                ? 'bg-blue-500'
                                : lens.status === 'expired'
                                  ? 'bg-red-500'
                                  : 'bg-gray-500'
                        }`}
                      />
                      <span
                        className={`font-medium ${getStatusColor(lens.status)}`}
                      >
                        {getStatusText(lens.status)}
                      </span>
                    </div>
                  )}
                </div>

                {(lens.openedDate ||
                  lens.status === 'in-use' ||
                  lens.status === 'opened' ||
                  isEditing) && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Дата открытия
                    </label>
                    {isEditing ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="date"
                          value={
                            editData?.openedDate
                              ? editData.openedDate.split('T')[0]
                              : ''
                          }
                          onChange={(e) => {
                            const date = e.target.value || ''
                            setEditData((prev) => {
                              if (!prev) return null
                              const nextOpenedDate = date ? date : null
                              const nextStatus = date
                                ? prev.status === 'unopened'
                                  ? 'opened'
                                  : prev.status
                                : 'unopened'
                              return {
                                ...prev,
                                openedDate: nextOpenedDate,
                                status: nextStatus
                              }
                            })
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        {editData?.openedDate && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditData((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      openedDate: null,
                                      status: 'unopened'
                                    }
                                  : null
                              )
                            }
                            className="shrink-0 rounded-xl border-2 border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            Очистить
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-base font-medium text-gray-900 sm:text-lg dark:text-white">
                        {lens.openedDate
                          ? formatDate(parseDate(lens.openedDate))
                          : 'Не указана'}
                      </p>
                    )}
                  </div>
                )}

                {lens.openedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Период использования:
                    </label>
                    <p className="mt-2 text-base font-medium text-gray-900 sm:text-lg dark:text-white">
                      {lens.usagePeriodDays} д.
                    </p>
                  </div>
                )}

                {discardDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Дата утилизации
                    </label>
                    <p
                      className={`mt-2 text-base font-medium sm:text-lg ${
                        isExpired
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {formatDate(discardDate)}
                      {remainingDays !== null && (
                        <span className="ml-2 text-sm text-gray-500">
                          {remainingDays > 0
                            ? `осталось ${remainingDays}д.`
                            : 'истекли'}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalContainer>
  )
}
