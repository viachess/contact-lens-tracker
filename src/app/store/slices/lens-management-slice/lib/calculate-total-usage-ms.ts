import { getStartOfLocalDay } from '@/shared/lib'
import { Lens } from '../types'

export const calculateTotalUsageMs = (lens: Lens): number => {
  const accumulatedRaw = lens.accumulatedUsageMs ?? 0
  const accumulated = Number.isFinite(accumulatedRaw) ? accumulatedRaw : 0

  const parsedMs = lens.lastResumedAt
    ? new Date(lens.lastResumedAt).getTime()
    : null
  const lastResumedAtMs =
    parsedMs !== null && Number.isFinite(parsedMs) ? parsedMs : null
  const now = Date.now()
  const additional =
    lens.status === 'in-use' && lastResumedAtMs !== null
      ? Math.max(0, now - lastResumedAtMs)
      : 0
  return accumulated + additional
}

/**
 * Calculates total usage time with excess time deduction for multi-day lenses.
 * When a lens is used on different days, any unused time from previous days
 * is considered "excess" and deducted from the remaining usage time.
 */
export const calculateTotalUsageMsWithExcessDeduction = (
  lens: Lens
): number => {
  if (!lens.openedDate || lens.wearPeriodDays <= 1) {
    // For daily lenses or lenses without opened date, use regular calculation
    return calculateTotalUsageMs(lens)
  }

  const openedDate = new Date(lens.openedDate)
  const now = new Date()
  const msPerDay = 24 * 60 * 60 * 1000

  // Calculate calendar days since opened
  const openedStartOfDay = getStartOfLocalDay(openedDate)
  const nowStartOfDay = getStartOfLocalDay(now)
  const calendarDaysElapsed = Math.floor(
    (nowStartOfDay.getTime() - openedStartOfDay.getTime()) / msPerDay
  )

  // For multi-day lenses, we need to account for excess time
  // Each day the lens is "active" (regardless of actual wear time) consumes a full day
  const totalUsageMs = calculateTotalUsageMs(lens)
  const actualWearDays = Math.floor(totalUsageMs / msPerDay)

  // Calculate excess time: if we've used the lens on more days than actual wear time,
  // we need to deduct the excess
  const excessDays = Math.max(0, calendarDaysElapsed - actualWearDays)
  const excessMs = excessDays * msPerDay

  // The effective usage is the actual wear time plus any excess time
  // But we cap it at the total calendar time elapsed
  const effectiveUsageMs = Math.min(
    totalUsageMs + excessMs,
    calendarDaysElapsed * msPerDay
  )

  return effectiveUsageMs
}
