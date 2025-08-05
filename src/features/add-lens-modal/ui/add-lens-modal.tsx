import { MODAL_IDS } from '@/app/store'
import { ModalContainer } from '@/shared/ui/portal-modal'
import { useState } from 'react'
import { Lens } from '@/app/store/slices/lens-management-slice'

interface AddLensModalProps {
  onClose: () => void
  onAdd: (lens: Omit<Lens, 'id'>) => void
}

export const AddLensModal = ({ onClose, onAdd }: AddLensModalProps) => {
  console.log('AddLensModal rendered')

  const [formData, setFormData] = useState<Omit<Lens, 'id'>>({
    manufacturer: '',
    brand: '',
    wearPeriodTitle: 'Ежедневные',
    wearPeriodDays: 1,
    usagePeriodDays: 1,
    discardDate: null,
    status: 'unopened',
    sphere: '',
    baseCurveRadius: '8.6',
    openedDate: null
  })

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSave = () => {
    if (formData.manufacturer && formData.sphere) {
      onAdd(formData)
      onClose()
    }
  }

  const handleCancel = () => {
    onClose()
  }

  const updateFormData = (field: string, value: string | null | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Update usage period when wear period changes
  const handleWearPeriodChange = (wearPeriod: string) => {
    // FIXME: update wearPeriodDays instead of usagePeriodDays. usagePeriodDays reflect the number of days a lens was actually used
    let usagePeriodDays = 1
    switch (wearPeriod) {
      case 'Ежедневные':
        usagePeriodDays = 1
        break
      case 'Двухнедельные':
        usagePeriodDays = 14
        break
      case 'Ежемесячные':
        usagePeriodDays = 30
        break
    }
    updateFormData('wearPeriodTitle', wearPeriod)
    updateFormData('usagePeriodDays', usagePeriodDays)
  }

  return (
    <ModalContainer name={MODAL_IDS.ADD_LENS}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
        onClick={handleBackgroundClick}
      >
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-gradient-to-br from-white to-gray-50 p-4 shadow-2xl sm:p-8 dark:from-gray-800 dark:to-gray-900">
          {/* Header with gradient background */}
          <div className="mb-6 rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-4 text-white sm:mb-8 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold sm:text-2xl">
                  Добавить новую линзу
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
                    Производитель *
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      updateFormData('manufacturer', e.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Например: Acuvue"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Бренд
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => updateFormData('brand', e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Например: TruEye"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Сфера *
                  </label>
                  <input
                    type="text"
                    value={formData.sphere}
                    onChange={(e) => updateFormData('sphere', e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Например: -4.5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Радиус Кривизны
                  </label>
                  <input
                    type="text"
                    value={formData.baseCurveRadius}
                    onChange={(e) =>
                      updateFormData('baseCurveRadius', e.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Например: 8.6"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Тип линз
                  </label>
                  <select
                    value={formData.wearPeriodTitle}
                    onChange={(e) => handleWearPeriodChange(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Ежедневные">Ежедневные</option>
                    <option value="Двухнедельные">Двухнедельные</option>
                    <option value="Ежемесячные">Ежемесячные</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Период использования (дней)
                  </label>
                  <input
                    type="number"
                    value={formData.usagePeriodDays}
                    onChange={(e) =>
                      updateFormData(
                        'usagePeriodDays',
                        parseInt(e.target.value)
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    min="1"
                    max="365"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Начальный статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateFormData('status', e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="unopened">Не открыты</option>
                    <option value="opened">Открыты</option>
                    <option value="in-use">В использовании</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dates Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                Даты (опционально)
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Дата открытия
                  </label>
                  <input
                    type="date"
                    value={formData.openedDate || ''}
                    onChange={(e) => {
                      const date = e.target.value || null
                      updateFormData('openedDate', date)
                    }}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:px-4 sm:py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
            <button
              onClick={handleSave}
              disabled={!formData.manufacturer || !formData.sphere}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 font-semibold text-white transition-all hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
            >
              <span className="hidden sm:inline">Добавить линзу</span>
              <span className="sm:hidden">Добавить</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 sm:px-6 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Отменить
            </button>
          </div>
        </div>
      </div>
    </ModalContainer>
  )
}
