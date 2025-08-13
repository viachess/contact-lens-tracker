import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/app/store/types'
import { isLensExpired } from './lib'

// Base selectors
export const selectLensManagement = (state: RootState) => state.lensManagement
export const selectAllLenses = (state: RootState) => state.lensManagement.lenses
export const selectCurrentLens = (state: RootState) =>
  state.lensManagement.currentLens
export const selectIsLoading = (state: RootState) =>
  state.lensManagement.isLoading
export const selectError = (state: RootState) => state.lensManagement.error

// Derived selectors
export const selectLensById = (lensId: string) =>
  createSelector([selectAllLenses], (lenses) =>
    lenses.find((lens) => lens.id === lensId)
  )

export const selectLensesByStatus = (status: string) =>
  createSelector([selectAllLenses], (lenses) =>
    lenses.filter((lens) => lens.status === status)
  )

export const selectLensesInUse = createSelector([selectAllLenses], (lenses) =>
  lenses.filter((lens) => lens.status === 'in-use')
)

export const selectOpenedLenses = createSelector([selectAllLenses], (lenses) =>
  lenses.filter((lens) => lens.status === 'opened')
)

export const selectUnopenedLenses = createSelector(
  [selectAllLenses],
  (lenses) => lenses.filter((lens) => lens.status === 'unopened')
)

export const selectExpiredLenses = createSelector([selectAllLenses], (lenses) =>
  lenses.filter((lens) => isLensExpired(lens))
)

export const selectCurrentLensInUse = createSelector(
  [selectLensesInUse],
  (lensesInUse) => lensesInUse[0] || null
)

export const selectLensesCount = createSelector(
  [selectAllLenses],
  (lenses) => lenses.length
)

export const selectLensesCountByStatus = (status: string) =>
  createSelector([selectLensesByStatus(status)], (lenses) => lenses.length)

export const selectSwappableLenses = createSelector(
  [selectAllLenses],
  (lenses) =>
    lenses.filter(
      (lens) =>
        !isLensExpired(lens) &&
        lens.status !== 'in-use' &&
        lens.status !== 'unopened'
    )
)
