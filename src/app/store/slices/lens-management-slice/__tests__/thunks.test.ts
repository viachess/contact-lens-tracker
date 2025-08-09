import { configureStore } from '@reduxjs/toolkit'
import { lensManagementReducer } from '@/app/store/slices/lens-management-slice'
import {
  addLensForUser,
  updateLensForUser,
  swapCurrentLensForUser,
  fetchLensesForUser
} from '@/app/store/slices/lens-management-slice/slice'
import { vi } from 'vitest'
import * as supabaseClient from '@/shared/lib/supabaseClient'

const mockFrom = () => ({
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  order: vi.fn().mockReturnThis()
})

vi.spyOn(supabaseClient, 'supabase', 'get').mockReturnValue({
  from: vi.fn().mockImplementation(() => mockFrom())
} as any)

describe('lens thunks', () => {
  const makeStore = () =>
    configureStore({ reducer: { lensManagement: lensManagementReducer } })

  test('fetchLensesForUser empty list', async () => {
    const store = makeStore()
    await store.dispatch(fetchLensesForUser({ userId: 'u1' }) as any)
    expect(store.getState().lensManagement.lenses).toEqual([])
  })

  test('add/update/swap ok', async () => {
    const store = makeStore()
    await store.dispatch(fetchLensesForUser({ userId: 'u1' }) as any)
    await store.dispatch(
      addLensForUser({
        userId: 'u1',
        lens: {
          manufacturer: 'X',
          brand: '',
          wearPeriodTitle: 'Ежедневные',
          wearPeriodDays: 1,
          usagePeriodDays: 1,
          discardDate: null,
          status: 'opened',
          openedDate: null,
          sphere: '-1.0',
          baseCurveRadius: '8.6',
          accumulatedUsageMs: 0,
          lastResumedAt: null
        }
      }) as any
    )
    await store.dispatch(
      updateLensForUser({
        lens: {
          id: 'l1',
          manufacturer: 'Y',
          brand: '',
          wearPeriodTitle: 'Ежедневные',
          wearPeriodDays: 1,
          usagePeriodDays: 1,
          discardDate: null,
          status: 'opened',
          openedDate: null,
          sphere: '-1.0',
          baseCurveRadius: '8.6',
          accumulatedUsageMs: 0,
          lastResumedAt: null
        }
      }) as any
    )
    await store.dispatch(
      swapCurrentLensForUser({ userId: 'u1', lensId: 'l1' }) as any
    )
  })
})
