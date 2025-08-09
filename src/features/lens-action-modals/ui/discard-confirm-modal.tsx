'use client'

import { ModalContainer } from '@/shared/ui/portal-modal'
import { MODAL_IDS } from '@/app/store'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { closeModal } from '@/app/store/slices/modal-slice/slice'
import { discardCurrentLensForUser } from '@/app/store/slices/lens-management-slice/slice'
import { selectUser } from '@/app/store/slices/auth-slice/selectors'

export const DiscardConfirmModal = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)

  const handleCancel = () => dispatch(closeModal())
  const handleConfirm = () => {
    if (user?.id) {
      dispatch(discardCurrentLensForUser({ userId: user.id }))
    }
    dispatch(closeModal())
  }

  return (
    <ModalContainer name={MODAL_IDS.LENS_DISCARD_CONFIRM}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Утилизировать линзы?
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
            Это действие отметит текущие линзы как «Истекли» и завершит их
            использование.
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
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Утилизировать
            </button>
          </div>
        </div>
      </div>
    </ModalContainer>
  )
}
