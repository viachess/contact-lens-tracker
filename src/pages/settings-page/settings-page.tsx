import { useState } from 'react'
import { EditIcon, TrashIcon } from '@/shared/ui/icons'

export const SettingsPage = () => {
  const [selectedLens, setSelectedLens] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLensClick = (lens: any) => {
    setSelectedLens(lens)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedLens(null)
  }

  const userLenses = [
    {
      id: 1,
      name: 'Acuvue TruEye -4.5',
      wearPeriod: 'Ежедневные',
      status: 'in-use',
      discardDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      openedDate: null
    },
    {
      id: 2,
      name: 'Acuvue Oasys 1-Day -3.75',
      wearPeriod: 'Ежедневные',
      status: 'opened',
      discardDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      openedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      id: 3,
      name: 'Air Optix plus HydraGlyde -2.25',
      wearPeriod: 'Ежемесячные',
      status: 'unopened',
      discardDate: null,
      openedDate: null
    },
    {
      id: 4,
      name: 'Biofinity -1.5',
      wearPeriod: 'Ежемесячные',
      status: 'expired',
      discardDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      openedDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000) // 32 days ago
    }
  ]

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
      case 'unopened':
        return 'Не открыты'
      case 'expired':
        return 'Истекли'
      default:
        return 'Неизвестно'
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900 dark:text-white">
        Настройки
      </h1>

      <div className="rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Мои линзы
          </h2>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            Добавить линзу
          </button>
        </div>

        <div className="space-y-3">
          {userLenses.map((lens) => (
            <div
              key={lens.id}
              className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-700/50"
              onClick={() => handleLensClick(lens)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {lens.name}
                  </h3>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {lens.wearPeriod}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span
                    className={`font-medium ${getStatusColor(lens.status)}`}
                  >
                    {lens.status === 'expired'
                      ? `Истекли ${formatDate(lens.discardDate)}`
                      : lens.status === 'opened'
                        ? `Открыты ${formatDate(lens.openedDate)}`
                        : getStatusText(lens.status)}
                  </span>
                </div>
              </div>

              {lens.status !== 'expired' && lens.status !== 'unopened' && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Утилизировать:
                  </div>
                  <div
                    className={`text-sm ${
                      lens.discardDate && lens.discardDate < new Date()
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {lens.discardDate ? formatDate(lens.discardDate) : 'N/A'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && selectedLens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Детали линзы
              </h3>
              <button
                onClick={closeModal}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              >
                <svg
                  className="size-6"
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

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Название
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedLens.name}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Тип
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedLens.wearPeriod}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Статус
                </label>
                <p
                  className={`font-medium ${getStatusColor(
                    selectedLens.status
                  )}`}
                >
                  {selectedLens.status === 'expired'
                    ? `Истекли ${formatDate(selectedLens.discardDate)}`
                    : selectedLens.status === 'opened'
                      ? `Открыты ${formatDate(selectedLens.openedDate)}`
                      : getStatusText(selectedLens.status)}
                </p>
              </div>

              {selectedLens.openedDate && selectedLens.status !== 'expired' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Дата открытия
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(selectedLens.openedDate)}
                  </p>
                </div>
              )}

              {selectedLens.status !== 'expired' &&
                selectedLens.status !== 'unopened' &&
                selectedLens.discardDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Утилизировать до
                    </label>
                    <p
                      className={`${
                        selectedLens.discardDate < new Date()
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {formatDate(selectedLens.discardDate)}
                    </p>
                  </div>
                )}
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                <EditIcon className="size-4" />
                Редактировать
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
                <TrashIcon className="size-4" />
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
