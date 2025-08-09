import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest'
import { calculateTotalUsageMs } from '@/app/store/slices/lens-management-slice/selectors'
import { Lens } from '@/app/store/slices/lens-management-slice/types'

const fixedNow = new Date('2024-01-01T00:00:00.000Z')

const makeLens = (overrides: Partial<Lens> = {}): Lens => ({
  id: 'l1',
  manufacturer: 'M',
  brand: 'B',
  wearPeriodTitle: 'Ежедневные',
  wearPeriodDays: 1,
  usagePeriodDays: 1,
  discardDate: null,
  status: 'in-use',
  openedDate: '2024-01-01T00:00:00.000Z',
  sphere: '-1.0',
  baseCurveRadius: '8.6',
  accumulatedUsageMs: 0,
  lastResumedAt: null,
  ...overrides
})

describe('calculateTotalUsageMs', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test('returns accumulated when lastResumedAt is malformed string (status in-use)', () => {
    const lens = makeLens({
      accumulatedUsageMs: 1000,
      status: 'in-use',
      lastResumedAt: 'not-a-date'
    })
    expect(calculateTotalUsageMs(lens)).toBe(1000)
  })

  test('returns accumulated when lastResumedAt is empty string', () => {
    const lens = makeLens({
      accumulatedUsageMs: 1000,
      status: 'in-use',
      lastResumedAt: ''
    })
    expect(calculateTotalUsageMs(lens)).toBe(1000)
  })

  test('returns accumulated when lastResumedAt is null', () => {
    const lens = makeLens({
      accumulatedUsageMs: 1000,
      status: 'in-use',
      lastResumedAt: null
    })
    expect(calculateTotalUsageMs(lens)).toBe(1000)
  })

  test('returns accumulated when status is not in-use and lastResumedAt malformed', () => {
    const lens = makeLens({
      accumulatedUsageMs: 1000,
      status: 'opened',
      lastResumedAt: '2024-13-99T99:99:99Z' // impossible date
    })
    expect(calculateTotalUsageMs(lens)).toBe(1000)
  })

  test('adds time difference when lastResumedAt is valid and status in-use', () => {
    const lens = makeLens({
      accumulatedUsageMs: 1000,
      status: 'in-use',
      lastResumedAt: '2023-12-31T23:59:00.000Z'
    })
    // 60 seconds between 23:59:00Z and 00:00:00Z
    expect(calculateTotalUsageMs(lens)).toBe(1000 + 60_000)
  })

  test('handles non-finite accumulatedUsageMs by treating as 0', () => {
    const lens = makeLens({
      // intentionally set to NaN to test guard
      accumulatedUsageMs: Number.NaN,
      status: 'in-use',
      lastResumedAt: '2023-12-31T23:59:00.000Z'
    })
    expect(calculateTotalUsageMs(lens)).toBe(60_000)
  })
})
