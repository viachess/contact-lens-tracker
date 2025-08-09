import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { nanoid } from 'nanoid'
import { Lens, LensManagementState } from './types'
import { getSupabaseClient } from '@/shared/lib/supabaseClient'
import { RootState } from '@/app/store/types'

const initialState: LensManagementState = {
  lenses: [],
  currentLens: null,
  isLoading: false,
  error: null
}

type LensRow = {
  id: string
  user_id: string
  manufacturer: string | null
  brand: string | null
  wear_period_title: string | null
  wear_period_days: number | null
  usage_period_days: number | null
  discard_date: string | null
  status: string | null
  opened_date: string | null
  sphere: string | null
  base_curve_radius: string | null
  accumulated_usage_ms: number | null
  last_resumed_at: string | null
}

const mapRowToLens = (row: LensRow): Lens => ({
  id: row.id,
  manufacturer: row.manufacturer ?? '',
  brand: row.brand ?? '',
  wearPeriodTitle: row.wear_period_title ?? '',
  wearPeriodDays: row.wear_period_days ?? 0,
  usagePeriodDays: row.usage_period_days ?? 0,
  discardDate: row.discard_date,
  status: (row.status as Lens['status']) ?? 'unopened',
  openedDate: row.opened_date,
  sphere: row.sphere ?? '',
  baseCurveRadius: row.base_curve_radius ?? '',
  accumulatedUsageMs: row.accumulated_usage_ms ?? 0,
  lastResumedAt: row.last_resumed_at
})

export const fetchLensesForUser = createAsyncThunk<
  { lenses: Lens[]; currentLens: Lens | null },
  { userId: string },
  { rejectValue: string }
>('lenses/fetchForUser', async ({ userId }, { rejectWithValue }) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('lenses')
    .select('*')
    .eq('user_id', userId)
    .order('opened_date', { ascending: false })

  if (error) return rejectWithValue(error.message)
  const lenses = (data as LensRow[]).map(mapRowToLens)
  const currentLens = lenses.find((l) => l.status === 'in-use') || null
  return { lenses, currentLens }
})

const mapLensToInsert = (userId: string, lens: Omit<Lens, 'id'>) => ({
  user_id: userId,
  manufacturer: lens.manufacturer || null,
  brand: lens.brand || null,
  wear_period_title: lens.wearPeriodTitle || null,
  wear_period_days: lens.wearPeriodDays ?? null,
  usage_period_days: lens.usagePeriodDays ?? null,
  discard_date: lens.discardDate || null,
  status: lens.status || null,
  opened_date: lens.openedDate || null,
  sphere: lens.sphere || null,
  base_curve_radius: lens.baseCurveRadius || null,
  accumulated_usage_ms: lens.accumulatedUsageMs ?? 0,
  last_resumed_at: lens.lastResumedAt || null
})

const mapLensToUpdate = (lens: Lens) => ({
  manufacturer: lens.manufacturer || null,
  brand: lens.brand || null,
  wear_period_title: lens.wearPeriodTitle || null,
  wear_period_days: lens.wearPeriodDays ?? null,
  usage_period_days: lens.usagePeriodDays ?? null,
  discard_date: lens.discardDate || null,
  status: lens.status || null,
  opened_date: lens.openedDate || null,
  sphere: lens.sphere || null,
  base_curve_radius: lens.baseCurveRadius || null,
  accumulated_usage_ms: lens.accumulatedUsageMs ?? 0,
  last_resumed_at: lens.lastResumedAt || null
})

export const addLensForUser = createAsyncThunk<
  Lens,
  { userId: string; lens: Omit<Lens, 'id'> },
  { rejectValue: string }
>('lenses/addForUser', async ({ userId, lens }, { rejectWithValue }) => {
  const payload = mapLensToInsert(userId, lens)
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('lenses')
    .insert(payload)
    .select('*')
    .single()
  if (error) return rejectWithValue(error.message)
  return mapRowToLens(data as LensRow)
})

export const updateLensForUser = createAsyncThunk<
  Lens,
  { lens: Lens },
  { state: RootState; rejectValue: string }
>('lenses/updateForUser', async ({ lens }, { getState, rejectWithValue }) => {
  const update = mapLensToUpdate(lens)
  const supabase = getSupabaseClient()

  const userId = getState()?.auth?.user?.id

  let query = supabase.from('lenses').update(update).eq('id', lens.id)
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query.select('*').single()
  if (error) return rejectWithValue(error.message)
  return mapRowToLens(data as LensRow)
})

export const deleteLensForUser = createAsyncThunk<
  { id: string },
  { userId: string; id: string },
  { rejectValue: string }
>('lenses/deleteForUser', async ({ userId, id }, { rejectWithValue }) => {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('lenses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) return rejectWithValue(error.message)
  return { id }
})

export const swapCurrentLensForUser = createAsyncThunk<
  { updatedCurrent: Lens; updatedPrev?: Lens },
  { userId: string; lensId: string },
  { state: { lensManagement: LensManagementState }; rejectValue: string }
>(
  'lenses/swapCurrentForUser',
  async ({ userId, lensId }, { getState, rejectWithValue }) => {
    const supabase = getSupabaseClient()
    const { currentLens } = getState().lensManagement
    const nowIso = new Date().toISOString()
    // Update previous current lens to opened
    let updatedPrev: Lens | undefined
    if (currentLens && currentLens.id !== lensId) {
      const prevUpdate = {
        ...mapLensToUpdate({
          ...currentLens,
          status: 'opened',
          lastResumedAt: null
        }),
        user_id: userId
      }
      const { data: prevData, error: prevErr } = await supabase
        .from('lenses')
        .update(prevUpdate)
        .eq('id', currentLens.id)
        .eq('user_id', userId)
        .select('*')
        .single()
      if (prevErr) return rejectWithValue(prevErr.message)
      updatedPrev = mapRowToLens(prevData as LensRow)
    }
    // Set new current lens to in-use
    const { data, error } = await supabase
      .from('lenses')
      .update({
        status: 'in-use',
        opened_date: nowIso,
        last_resumed_at: nowIso
      })
      .eq('id', lensId)
      .eq('user_id', userId)
      .select('*')
      .single()
    if (error) return rejectWithValue(error.message)
    const updatedCurrent = mapRowToLens(data as LensRow)
    // Ensure opened_date is set if missing
    if (!updatedCurrent.openedDate) updatedCurrent.openedDate = nowIso
    return { updatedCurrent, updatedPrev }
  }
)

export const takeOffCurrentLensForUser = createAsyncThunk<
  { updated: Lens },
  { userId: string },
  { state: { lensManagement: LensManagementState }; rejectValue: string }
>(
  'lenses/takeOffCurrentForUser',
  async ({ userId }, { getState, rejectWithValue }) => {
    const supabase = getSupabaseClient()
    const { currentLens } = getState().lensManagement
    if (!currentLens) return rejectWithValue('No current lens in use') as any
    const now = Date.now()
    const lastResumedAtMs = currentLens.lastResumedAt
      ? new Date(currentLens.lastResumedAt).getTime()
      : null
    const accumulated = currentLens.accumulatedUsageMs ?? 0
    const additional = lastResumedAtMs ? Math.max(0, now - lastResumedAtMs) : 0
    const total = accumulated + additional
    const { data, error } = await supabase
      .from('lenses')
      .update({
        status: 'taken-off',
        accumulated_usage_ms: total,
        last_resumed_at: null,
        user_id: userId
      })
      .eq('id', currentLens.id)
      .eq('user_id', userId)
      .select('*')
      .single()
    if (error) return rejectWithValue(error.message)
    return { updated: mapRowToLens(data as LensRow) }
  }
)

export const resumeLensForUser = createAsyncThunk<
  { updatedCurrent: Lens; updatedPrev?: Lens },
  { userId: string; lensId: string },
  { state: { lensManagement: LensManagementState }; rejectValue: string }
>(
  'lenses/resumeForUser',
  async ({ userId, lensId }, { getState, rejectWithValue }) => {
    const supabase = getSupabaseClient()
    const { currentLens } = getState().lensManagement
    const nowIso = new Date().toISOString()
    let updatedPrev: Lens | undefined
    if (currentLens && currentLens.id !== lensId) {
      const { data: prevData, error: prevErr } = await supabase
        .from('lenses')
        .update({ status: 'opened', last_resumed_at: null, user_id: userId })
        .eq('id', currentLens.id)
        .eq('user_id', userId)
        .select('*')
        .single()
      if (prevErr) return rejectWithValue(prevErr.message)
      updatedPrev = mapRowToLens(prevData as LensRow)
    }
    const { data, error } = await supabase
      .from('lenses')
      .update({
        status: 'in-use',
        opened_date: nowIso,
        last_resumed_at: nowIso,
        user_id: userId
      })
      .eq('id', lensId)
      .eq('user_id', userId)
      .select('*')
      .single()
    if (error) return rejectWithValue(error.message)
    const updatedCurrent = mapRowToLens(data as LensRow)
    if (!updatedCurrent.openedDate) updatedCurrent.openedDate = nowIso
    return { updatedCurrent, updatedPrev }
  }
)

export const discardCurrentLensForUser = createAsyncThunk<
  { updated: Lens },
  { userId: string },
  { state: { lensManagement: LensManagementState }; rejectValue: string }
>(
  'lenses/discardCurrentForUser',
  async ({ userId }, { getState, rejectWithValue }) => {
    const supabase = getSupabaseClient()
    const { currentLens } = getState().lensManagement
    if (!currentLens)
      return rejectWithValue('No current lens to discard') as any
    const now = Date.now()
    const lastResumedAtMs = currentLens.lastResumedAt
      ? new Date(currentLens.lastResumedAt).getTime()
      : null
    const accumulated = currentLens.accumulatedUsageMs ?? 0
    const additional = lastResumedAtMs ? Math.max(0, now - lastResumedAtMs) : 0
    const totalUsageMs = accumulated + additional
    const msPerDay = 24 * 60 * 60 * 1000
    const usageDays = Math.min(
      currentLens.wearPeriodDays,
      Math.round(totalUsageMs / msPerDay)
    )
    const discardDateIso = new Date().toISOString()
    const { data, error } = await supabase
      .from('lenses')
      .update({
        status: 'expired',
        discard_date: discardDateIso,
        usage_period_days: usageDays,
        accumulated_usage_ms: totalUsageMs,
        last_resumed_at: null,
        user_id: userId
      })
      .eq('id', currentLens.id)
      .eq('user_id', userId)
      .select('*')
      .single()
    if (error) return rejectWithValue(error.message)
    return { updated: mapRowToLens(data as LensRow) }
  }
)

const lensManagementSlice = createSlice({
  name: 'lens-management-slice',
  initialState,
  reducers: {
    // CRUD Operations
    addLens: (state, action: PayloadAction<Omit<Lens, 'id'>>) => {
      const newLens: Lens = {
        ...action.payload,
        id: nanoid(5)
      }
      state.lenses.push(newLens)
    },
    updateLens: (state, action: PayloadAction<Lens>) => {
      const index = state.lenses.findIndex((l) => l.id === action.payload.id)
      if (index !== -1) {
        state.lenses[index] = action.payload
      }
    },
    deleteLens: (state, action: PayloadAction<string>) => {
      state.lenses = state.lenses.filter((l) => l.id !== action.payload)
      if (state.currentLens?.id === action.payload) {
        state.currentLens = null
      }
    },
    setLenses: (state, action: PayloadAction<Lens[]>) => {
      state.lenses = action.payload
    },

    // Current Lens Selection
    setCurrentLens: (state, action: PayloadAction<Lens | null>) => {
      state.currentLens = action.payload
    },
    clearCurrentLens: (state) => {
      state.currentLens = null
    },

    // New action to swap current lens
    swapCurrentLens: (state, action: PayloadAction<string>) => {
      const lensToSwap = state.lenses.find((l) => l.id === action.payload)
      if (lensToSwap) {
        // If there's a current lens, change its status to 'opened'
        if (state.currentLens) {
          const currentLensIndex = state.lenses.findIndex(
            (l) => l.id === state.currentLens!.id
          )
          if (currentLensIndex !== -1) {
            state.lenses[currentLensIndex].status = 'opened'
            state.lenses[currentLensIndex].lastResumedAt = null
          }
        }

        // Set the new lens as current and change its status to 'in-use'
        const newCurrentLensIndex = state.lenses.findIndex(
          (l) => l.id === action.payload
        )
        if (newCurrentLensIndex !== -1) {
          state.lenses[newCurrentLensIndex].status = 'in-use'
          state.lenses[newCurrentLensIndex].openedDate =
            state.lenses[newCurrentLensIndex].openedDate ||
            new Date().toISOString()
          state.lenses[newCurrentLensIndex].lastResumedAt =
            new Date().toISOString()
          state.currentLens = state.lenses[newCurrentLensIndex]
        }
      }
    },

    // Take off current lens, accumulating time since last resume
    takeOffCurrentLens: (state) => {
      const current = state.currentLens
      if (!current) return
      const idx = state.lenses.findIndex((l) => l.id === current.id)
      if (idx === -1) return
      const now = Date.now()
      const lastResumedAtMs = current.lastResumedAt
        ? new Date(current.lastResumedAt).getTime()
        : null
      const accumulated = current.accumulatedUsageMs ?? 0
      const additional = lastResumedAtMs
        ? Math.max(0, now - lastResumedAtMs)
        : 0
      const updated: Lens = {
        ...current,
        status: 'taken-off',
        accumulatedUsageMs: accumulated + additional,
        lastResumedAt: null
      }
      state.lenses[idx] = updated
      // After taking off, clear current lens selection
      state.currentLens = null
    },

    // Resume usage of a paused or opened lens
    resumeLens: (state, action: PayloadAction<string>) => {
      const idx = state.lenses.findIndex((l) => l.id === action.payload)
      if (idx === -1) return
      const lensBefore = state.lenses[idx]
      // For daily lenses: if day changed since opened, expire instead of resuming
      if (
        lensBefore.wearPeriodDays === 1 &&
        lensBefore.openedDate &&
        new Date(lensBefore.openedDate).toDateString() !==
          new Date().toDateString()
      ) {
        const expired: Lens = {
          ...lensBefore,
          status: 'expired',
          discardDate: new Date().toISOString(),
          lastResumedAt: null
        }
        state.lenses[idx] = expired
        if (state.currentLens?.id === expired.id) {
          state.currentLens = null
        }
        return
      }
      // If there is a current lens, set it to opened and clear lastResumedAt
      if (state.currentLens && state.currentLens.id !== action.payload) {
        const cIdx = state.lenses.findIndex(
          (l) => l.id === state.currentLens!.id
        )
        if (cIdx !== -1) {
          state.lenses[cIdx] = {
            ...state.lenses[cIdx],
            status: 'opened',
            lastResumedAt: null
          }
        }
      }
      const lens = state.lenses[idx]
      const updated: Lens = {
        ...lens,
        status: 'in-use',
        openedDate: lens.openedDate || new Date().toISOString(),
        lastResumedAt: new Date().toISOString()
      }
      state.lenses[idx] = updated
      state.currentLens = updated
    },

    // Discard current lens: mark as expired and finalize usage time
    discardCurrentLens: (state) => {
      const current = state.currentLens
      if (!current) return
      const idx = state.lenses.findIndex((l) => l.id === current.id)
      if (idx === -1) return
      const now = Date.now()
      const lastResumedAtMs = current.lastResumedAt
        ? new Date(current.lastResumedAt).getTime()
        : null
      const accumulated = current.accumulatedUsageMs ?? 0
      const additional = lastResumedAtMs
        ? Math.max(0, now - lastResumedAtMs)
        : 0
      const totalUsageMs = accumulated + additional
      const msPerDay = 24 * 60 * 60 * 1000
      const usageDays = Math.min(
        current.wearPeriodDays,
        Math.round(totalUsageMs / msPerDay)
      )
      const updated: Lens = {
        ...current,
        status: 'expired',
        discardDate: new Date().toISOString(),
        usagePeriodDays: usageDays,
        accumulatedUsageMs: totalUsageMs,
        lastResumedAt: null
      }
      state.lenses[idx] = updated
      state.currentLens = null
    },

    // Loading States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLensesForUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLensesForUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.lenses = action.payload.lenses
        state.currentLens = action.payload.currentLens
      })
      .addCase(fetchLensesForUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || action.error.message || null
      })
      .addCase(addLensForUser.fulfilled, (state, action) => {
        state.lenses.push(action.payload)
        if (action.payload.status === 'in-use') {
          state.currentLens = action.payload
        }
      })
      .addCase(updateLensForUser.fulfilled, (state, action) => {
        const idx = state.lenses.findIndex((l) => l.id === action.payload.id)
        if (idx !== -1) state.lenses[idx] = action.payload
        if (state.currentLens?.id === action.payload.id) {
          state.currentLens = action.payload
        }
      })
      .addCase(deleteLensForUser.fulfilled, (state, action) => {
        state.lenses = state.lenses.filter((l) => l.id !== action.payload.id)
        if (state.currentLens?.id === action.payload.id) {
          state.currentLens = null
        }
      })
      .addCase(swapCurrentLensForUser.fulfilled, (state, action) => {
        const { updatedCurrent, updatedPrev } = action.payload
        const currIdx = state.lenses.findIndex(
          (l) => l.id === updatedCurrent.id
        )
        if (currIdx !== -1) state.lenses[currIdx] = updatedCurrent
        if (updatedPrev) {
          const prevIdx = state.lenses.findIndex((l) => l.id === updatedPrev.id)
          if (prevIdx !== -1) state.lenses[prevIdx] = updatedPrev
        }
        state.currentLens = updatedCurrent
      })
      // Persisted timing actions
      .addCase(takeOffCurrentLensForUser.fulfilled, (state, action) => {
        const updated = action.payload.updated
        const idx = state.lenses.findIndex((l) => l.id === updated.id)
        if (idx !== -1) state.lenses[idx] = updated
        state.currentLens = null
      })
      .addCase(resumeLensForUser.fulfilled, (state, action) => {
        const { updatedCurrent, updatedPrev } = action.payload
        const currIdx = state.lenses.findIndex(
          (l) => l.id === updatedCurrent.id
        )
        if (currIdx !== -1) state.lenses[currIdx] = updatedCurrent
        if (updatedPrev) {
          const prevIdx = state.lenses.findIndex((l) => l.id === updatedPrev.id)
          if (prevIdx !== -1) state.lenses[prevIdx] = updatedPrev
        }
        state.currentLens = updatedCurrent
      })
      .addCase(discardCurrentLensForUser.fulfilled, (state, action) => {
        const updated = action.payload.updated
        const idx = state.lenses.findIndex((l) => l.id === updated.id)
        if (idx !== -1) state.lenses[idx] = updated
        state.currentLens = null
      })
  }
})

export const {
  setLenses,
  setCurrentLens,
  clearCurrentLens,
  takeOffCurrentLens,
  resumeLens,
  discardCurrentLens,
  setLoading,
  setError
} = lensManagementSlice.actions

export const lensManagementReducer = lensManagementSlice.reducer
