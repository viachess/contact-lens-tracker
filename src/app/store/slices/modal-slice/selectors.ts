import { RootState } from '@/app/store/types'

export const selectOpenedModal = (state: RootState) => state.modal.openedModal
