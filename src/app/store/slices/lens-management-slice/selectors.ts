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
  // For daily lenses, expire strictly by calendar day
  if (lens.wearPeriodDays === 1) {
    const opened = parseDate(lens.openedDate)
    if (!opened) return false
    const now = new Date()
    return !isSameLocalDay(opened, now) || lens.status === 'expired'
  }
  // For longer periods, use usage time-based expiration
  const totalUsageMs = calculateTotalUsageMs(lens)
  const msPerDay = 24 * 60 * 60 * 1000
  const usageDays = Math.floor(totalUsageMs / msPerDay)
  return usageDays >= lens.wearPeriodDays || lens.status === 'expired'
}

export const getRemainingDays = (lens: Lens | null): number | null => {
  if (!lens || !lens.openedDate) return null
  if (lens.wearPeriodDays === 1) {
    // For daily lenses, remaining "days" isn't meaningful; return 0 or 1
    return isLensExpired(lens) ? 0 : 1
  }
  const totalUsageMs = calculateTotalUsageMs(lens)
  const msPerDay = 24 * 60 * 60 * 1000
  const usedDays = Math.floor(totalUsageMs / msPerDay)
  return Math.max(0, lens.wearPeriodDays - usedDays)
}

export const getRemainingHours = (lens: Lens | null): number | null => {
  if (!lens || !lens.openedDate) return null
  if (lens.wearPeriodDays === 1) {
    const opened = parseDate(lens.openedDate)
    if (!opened) return null
    if (isLensExpired(lens)) return 0
    const endOfDay = getEndOfLocalDay(opened)
    const now = new Date()
    const remainingMs = Math.max(0, endOfDay.getTime() - now.getTime())
    return Math.ceil(remainingMs / (60 * 60 * 1000))
  }
  const totalUsageMs = calculateTotalUsageMs(lens)
  const msPerDay = 24 * 60 * 60 * 1000
  const usedDays = Math.floor(totalUsageMs / msPerDay)
  const usedMsIntoDay = totalUsageMs - usedDays * msPerDay
  const remainingDays = Math.max(0, lens.wearPeriodDays - usedDays)
  if (remainingDays <= 0) return 0
  const remainingMsInCurrentDay = msPerDay - usedMsIntoDay
  return Math.ceil(remainingMsInCurrentDay / (60 * 60 * 1000))
}

export const calculateTotalUsageMs = (lens: Lens): number => {
  const accumulated = lens.accumulatedUsageMs ?? 0
  const lastResumedAtMs = lens.lastResumedAt
    ? new Date(lens.lastResumedAt).getTime()
    : null
  const now = Date.now()
  const additional =
    lens.status === 'in-use' && lastResumedAtMs
      ? Math.max(0, now - lastResumedAtMs)
      : 0
  return accumulated + additional
}

// Date helpers (local timezone)
export const getStartOfLocalDay = (date: Date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0
  )
}

export const getEndOfLocalDay = (date: Date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  )
}

export const isSameLocalDay = (a: Date, b: Date) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
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
