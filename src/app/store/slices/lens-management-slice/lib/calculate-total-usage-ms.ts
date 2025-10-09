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
