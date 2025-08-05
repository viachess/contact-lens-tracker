import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/app/store/types'
import { Lens } from './types'

// Utility function to convert string date to Date object
export const parseDate = (dateString: string | null): Date | null => {
  if (!dateString) return null
  return new Date(dateString)
}

// Utility function to check if lens is expired
export const isLensExpired = (lens: Lens): boolean => {
  if (!lens.openedDate) return false
  return lens.usagePeriodDays >= lens.wearPeriodDays
}

export const getRemainingDays = (lens: Lens | null): number | null => {
  if (!lens || !lens.openedDate) return null
  return lens.wearPeriodDays - lens.usagePeriodDays
}

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

// New selector for lenses that can be swapped (not expired and not current)
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
