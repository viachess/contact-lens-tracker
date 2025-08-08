import { configureStore } from '@reduxjs/toolkit'
import { appSliceReducer } from './slices/app-slice/appSlice'
import { modalSliceReducer } from './slices/modal-slice/slice'
import { lensManagementReducer } from './slices/lens-management-slice'
import { authSliceReducer } from './slices/auth-slice/slice'

export const store = configureStore({
  reducer: {
    app: appSliceReducer,
    modal: modalSliceReducer,
    lensManagement: lensManagementReducer,
    auth: authSliceReducer
  }
})
