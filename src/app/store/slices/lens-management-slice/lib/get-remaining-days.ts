import { calculateTotalUsageMs } from './calculate-total-usage-ms'
import { isLensExpired } from './is-lens-expired'
import { Lens } from '../types'

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
