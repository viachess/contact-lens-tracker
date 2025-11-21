import { configureStore } from '@reduxjs/toolkit';
import { lensManagementReducer } from '@/app/store/slices/lens-management-slice';
import { authSliceReducer } from '@/app/store/slices/auth-slice/slice';
import {
  addLensForUser,
  updateLensForUser,
  swapCurrentLensForUser,
  fetchLensesForUser,
  takeOffCurrentLensForUser,
  resumeLensForUser,
  discardCurrentLensForUser
} from '@/app/store/slices/lens-management-slice/slice';
import { vi, describe, test, beforeEach, afterEach, expect } from 'vitest';
import * as supabaseClient from '@/shared/lib/supabase-client';

// Logging helpers (single place where console is used)

const stepLog = (message: string, details?: unknown) => {
  if (details !== undefined) console.info(`[step] ${message}`, details);
  else console.info(`[step] ${message}`);
};
const assertLog = (name: string, value: unknown) => {
  console.info(`[assert] ${name}:`, value);
};

// In-memory Supabase mock for 'lenses'
type LensRow = Record<string, any>;
const lensesTable: Record<string, LensRow> = {};
let idCounter = 1;

function lensesQueryBuilder() {
  const query: any = {
    filter: {},
    op: null,
    insertPayload: null,
    updatePayload: null
  };
  const api: any = {
    insert(payload: any) {
      query.op = 'insert';
      query.insertPayload = payload;
      return api;
    },
    update(payload: any) {
      query.op = 'update';
      query.updatePayload = payload;
      return api;
    },
    delete() {
      query.op = 'delete';
      return api;
    },
    eq(column: string, value: any) {
      query.filter[column] = value;
      return api;
    },
    select() {
      // Do not override op; allow insert/update -> select -> single chains
      return api;
    },
    order() {
      // Execute select now for collections
      const rows = Object.values(lensesTable).filter((r: any) => {
        if (query.filter.user_id !== undefined) {
          return r.user_id === query.filter.user_id;
        }
        return true;
      });
      return Promise.resolve({ data: rows, error: null });
    },
    single() {
      if (query.op === 'insert') {
        const id = `l${idCounter++}`;
        const row = { id, ...query.insertPayload };
        lensesTable[id] = row;
        return Promise.resolve({ data: row, error: null });
      }
      if (query.op === 'update') {
        const id = query.filter.id;
        const row = lensesTable[id];
        if (!row)
          return Promise.resolve({
            data: null,
            error: { message: 'Not found' }
          });
        const updated = { ...row, ...query.updatePayload };
        // If user_id not provided in update, keep existing
        if (query.updatePayload && query.updatePayload.user_id == null) {
          updated.user_id = row.user_id;
        }
        lensesTable[id] = updated;
        // If chained with select().single(), return selected
        return Promise.resolve({ data: updated, error: null });
      }
      if (query.op === 'delete') {
        const id = query.filter.id;
        if (id && lensesTable[id]) delete lensesTable[id];
        return Promise.resolve({ data: null, error: null });
      }
      // For select().single() after eq('id',..)
      if (query.filter.id) {
        const row = lensesTable[query.filter.id];
        return Promise.resolve({ data: row ?? null, error: null });
      }
      // Default
      return Promise.resolve({ data: null, error: null });
    }
  };
  return api;
}

vi.spyOn(supabaseClient, 'getSupabaseClient').mockReturnValue({
  from: (table: string) => {
    if (table === 'lenses') return lensesQueryBuilder();
    throw new Error(`Unhandled table ${table}`);
  },
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
      error: null
    })
  }
} as any);

describe('lens thunks', () => {
  const makeStore = () =>
    configureStore({
      reducer: {
        lensManagement: lensManagementReducer,
        auth: authSliceReducer
      }
    });

  beforeEach(() => {
    stepLog('NEW TEST RUN');
    // Reset in-memory table between tests
    for (const key of Object.keys(lensesTable)) delete lensesTable[key];
    idCounter = 1;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T08:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('fetchLensesForUser empty list', async () => {
    const store = makeStore();
    stepLog('dispatch fetchLensesForUser { userId: u1 }');
    await store.dispatch(fetchLensesForUser({ userId: 'u1' }) as any);
    const lenses = store.getState().lensManagement.lenses;
    assertLog('lenses', lenses);
    expect(lenses).toEqual([]);
  });

  test('add/update/swap ok', async () => {
    const store = makeStore();
    stepLog('fetch before add');
    await store.dispatch(fetchLensesForUser({ userId: 'u1' }) as any);
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
    );
    stepLog('STATE after add', store.getState().lensManagement);
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
    );
    stepLog('STATE after update', store.getState().lensManagement);
    await store.dispatch(
      swapCurrentLensForUser({ userId: 'u1', lensId: 'l1' }) as any
    );
    stepLog('STATE after swap', store.getState().lensManagement);
  });

  test('two-week lens: daily wear until exhausted prevents further resume', async () => {
    const store = makeStore();

    // Insert a two-week lens
    stepLog('insert 14-day lens then swap to l1 (current)');
    await store.dispatch(
      addLensForUser({
        userId: 'u1',
        lens: {
          manufacturer: 'M',
          brand: 'B',
          wearPeriodTitle: 'Двухнедельные',
          wearPeriodDays: 14,
          usagePeriodDays: 14,
          discardDate: null,
          status: 'opened',
          openedDate: null,
          sphere: '-2.0',
          baseCurveRadius: '8.6',
          accumulatedUsageMs: 0,
          lastResumedAt: null
        }
      }) as any
    );

    // Capture created lens id from mock table
    const createdId = Object.keys(lensesTable as any).at(-1) as string;
    stepLog('created lens id', createdId);
    await store.dispatch(
      swapCurrentLensForUser({ userId: 'u1', lensId: createdId }) as any
    );
    stepLog('STATE after initial swap', store.getState().lensManagement);

    // Wear for 14 days, taking off each day
    for (let day = 0; day < 14; day++) {
      stepLog(`[DAY ${day + 1}] wear -> take off -> next morning resume`);
      // Assume currently in-use from previous swap/resume
      const evening = new Date(2025, 0, 1 + day, 20, 0, 0);
      vi.setSystemTime(evening); // evening
      stepLog('TIME evening ISO', evening.toISOString());
      await store.dispatch(takeOffCurrentLensForUser({ userId: 'u1' }) as any);
      stepLog('STATE after take off', store.getState().lensManagement);
      // Next day morning: put on again if allowed
      const morning = new Date(2025, 0, 2 + day, 8, 0, 0);
      vi.setSystemTime(morning);
      stepLog('TIME morning ISO', morning.toISOString());
      await store.dispatch(
        resumeLensForUser({ userId: 'u1', lensId: createdId }) as any
      );
      stepLog('STATE after resume', store.getState().lensManagement);
    }

    // After 14 cycles, another resume should not set current lens
    stepLog('[FINAL] take off then attempt resume beyond wear period');
    await store.dispatch(takeOffCurrentLensForUser({ userId: 'u1' }) as any);
    await store.dispatch(
      resumeLensForUser({ userId: 'u1', lensId: createdId }) as any
    );
    const stateAfter = store.getState().lensManagement;
    const currentId = stateAfter.currentLens?.id;
    assertLog('currentLens?.id', currentId);
    expect(currentId).not.toBe(createdId);
  });

  test('daily lens: multi-sessions within a day then next day lockout', async () => {
    const store = makeStore();

    // Insert a daily lens and put it on in the morning
    stepLog('insert daily lens then swap to l1 (current)');
    await store.dispatch(
      addLensForUser({
        userId: 'u1',
        lens: {
          manufacturer: 'M',
          brand: 'B',
          wearPeriodTitle: 'Ежедневные',
          wearPeriodDays: 1,
          usagePeriodDays: 1,
          discardDate: null,
          status: 'opened',
          openedDate: null,
          sphere: '-2.0',
          baseCurveRadius: '8.6',
          accumulatedUsageMs: 0,
          lastResumedAt: null
        }
      }) as any
    );

    const createdId = Object.keys(lensesTable as any).at(-1) as string;
    await store.dispatch(
      swapCurrentLensForUser({ userId: 'u1', lensId: createdId }) as any
    );
    stepLog('STATE after initial swap', store.getState().lensManagement);

    // Morning wear 2h
    vi.setSystemTime(new Date('2025-01-01T10:00:00.000Z'));
    stepLog('TIME 10:00Z take off');
    await store.dispatch(takeOffCurrentLensForUser({ userId: 'u1' }) as any);
    stepLog('STATE after morning take off', store.getState().lensManagement);

    // Idle 4h, then resume and wear to evening
    await store.dispatch(
      resumeLensForUser({ userId: 'u1', lensId: createdId }) as any
    );
    stepLog('STATE after midday resume', store.getState().lensManagement);
    vi.setSystemTime(new Date('2025-01-01T20:00:00.000Z'));
    stepLog('TIME 20:00Z evening take off');
    await store.dispatch(takeOffCurrentLensForUser({ userId: 'u1' }) as any);
    stepLog('STATE after evening take off', store.getState().lensManagement);

    // Next day morning: attempt to put on should be blocked/expired
    vi.setSystemTime(new Date('2025-01-02T08:00:00.000Z'));
    stepLog('TIME next day 08:00Z resume attempt (should lockout)');
    await store.dispatch(
      resumeLensForUser({ userId: 'u1', lensId: createdId }) as any
    );

    const state = store.getState().lensManagement;
    const currentId2 = state.currentLens?.id;
    assertLog('currentLens?.id', currentId2);
    expect(currentId2).not.toBe(createdId);
  });
});
