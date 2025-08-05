import { configureStore } from '@reduxjs/toolkit'
import { appSliceReducer } from './slices/app-slice/appSlice'
import { modalSliceReducer } from './slices/modal-slice/slice'
import { lensManagementReducer } from './slices/lens-management-slice'

export const store = configureStore({
  reducer: {
    app: appSliceReducer,
    modal: modalSliceReducer,
    lensManagement: lensManagementReducer
  }
})
