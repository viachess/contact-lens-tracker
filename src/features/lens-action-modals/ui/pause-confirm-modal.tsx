'use client'

import { ModalContainer } from '@/shared/ui/portal-modal'
import { MODAL_IDS } from '@/app/store'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { closeModal } from '@/app/store/slices/modal-slice/slice'
import { takeOffCurrentLensForUser } from '@/app/store/slices/lens-management-slice/slice'
import { memo } from 'react'
import { selectUser } from '@/app/store/slices/auth-slice/selectors'

export const PauseConfirmModal = memo(() => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)

  const handleCancel = () => dispatch(closeModal())
  const handleConfirm = () => {
    if (user?.id) {
      dispatch(takeOffCurrentLensForUser({ userId: user.id }))
    }
    dispatch(closeModal())
  }

  return (
    <ModalContainer name={MODAL_IDS.LENS_TAKE_OFF_CONFIRM}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
        <div className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] p-6 text-[var(--color-surface-text)] shadow-xl dark:bg-gray-800 dark:text-gray-100">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Снять линзы?
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
            Время использования будет остановлено. Вы сможете возобновить
            ношение позже.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Отмена
            </button>
            <button
              onClick={handleConfirm}
              className="rounded-lg bg-[var(--color-button-secondary)] px-4 py-2 text-[var(--color-button-secondary-text)] hover:brightness-95 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Снять
            </button>
          </div>
        </div>
      </div>
    </ModalContainer>
  )
})

PauseConfirmModal.displayName = 'PauseConfirmModal'
