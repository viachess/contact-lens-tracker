import { isSameLocalDay, parseDate } from '@/shared/lib'
import { Lens } from '../types'
import { calculateTotalUsageMs } from './calculate-total-usage-ms'

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
