import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { nanoid } from 'nanoid'
import { Lens, LensManagementState } from './types'

const mockLensesList: Lens[] = [
  {
    id: nanoid(5),
    manufacturer: 'Acuvue',
    brand: 'TruEye',
    wearPeriodTitle: 'Ежедневные',
    wearPeriodDays: 1,
    usagePeriodDays: 0,
    discardDate: null,
    status: 'unopened',
    openedDate: null,
    sphere: '-3.75',
    baseCurveRadius: '8.6',
    accumulatedUsageMs: 0,
    lastResumedAt: null
  },
  {
    id: nanoid(5),
    manufacturer: 'Acuvue',
    brand: 'TruEye',
    wearPeriodTitle: 'Ежедневные',
    wearPeriodDays: 1,
    usagePeriodDays: 1,
    discardDate: null,
    status: 'in-use',
    openedDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    sphere: '-4.5',
    baseCurveRadius: '8.6',
    accumulatedUsageMs: 6 * 60 * 60 * 1000,
    lastResumedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // resumed 1 hour ago
  },
  {
    id: nanoid(5),
    manufacturer: 'Acuvue',
    brand: 'Oasys',
    wearPeriodTitle: 'Ежедневные',
    wearPeriodDays: 1,
    usagePeriodDays: 0,
    discardDate: null,
    status: 'opened',
    openedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    sphere: '-3.75',
    baseCurveRadius: '8.6',
    accumulatedUsageMs: 0,
    lastResumedAt: null
  },
  {
    id: nanoid(5),
    manufacturer: 'Air Optix',
    brand: 'plus HydraGlyde',
    wearPeriodTitle: 'Ежемесячные',
    wearPeriodDays: 30,
    usagePeriodDays: 30,
    discardDate: null,
    status: 'unopened',
    openedDate: null,
    sphere: '-2.25',
    baseCurveRadius: '8.6',
    accumulatedUsageMs: 0,
    lastResumedAt: null
  },
  {
    id: nanoid(5),
    manufacturer: 'Biofinity',
    brand: '',
    wearPeriodTitle: 'Ежемесячные',
    wearPeriodDays: 30,
    usagePeriodDays: 30,
    discardDate: null,
    status: 'expired',
    openedDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(), // 32 days ago
    sphere: '-1.5',
    baseCurveRadius: '8.6',
    accumulatedUsageMs: 32 * 60 * 60 * 1000,
    lastResumedAt: null
  }
]

const initialState: LensManagementState = {
  lenses: mockLensesList,
  currentLens: mockLensesList[1], // Set the first lens (Acuvue TruEye) as current
  isLoading: false,
  error: null
}

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
  }
})

export const {
  addLens,
  updateLens,
  deleteLens,
  setLenses,
  setCurrentLens,
  clearCurrentLens,
  swapCurrentLens,
  takeOffCurrentLens,
  resumeLens,
  discardCurrentLens,
  setLoading,
  setError
} = lensManagementSlice.actions

export const lensManagementReducer = lensManagementSlice.reducer
