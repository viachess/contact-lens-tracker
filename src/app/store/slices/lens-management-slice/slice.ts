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
    usagePeriodDays: 1,
    discardDate: null,
    status: 'in-use',
    openedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    sphere: '-4.5',
    baseCurveRadius: '8.6'
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
    baseCurveRadius: '8.6'
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
    baseCurveRadius: '8.6'
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
    baseCurveRadius: '8.6'
  }
]

const initialState: LensManagementState = {
  lenses: mockLensesList,
  currentLens: mockLensesList[0], // Set the first lens (Acuvue TruEye) as current
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
          }
        }

        // Set the new lens as current and change its status to 'in-use'
        const newCurrentLensIndex = state.lenses.findIndex(
          (l) => l.id === action.payload
        )
        if (newCurrentLensIndex !== -1) {
          state.lenses[newCurrentLensIndex].status = 'in-use'
          state.currentLens = state.lenses[newCurrentLensIndex]
        }
      }
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
  setLoading,
  setError
} = lensManagementSlice.actions

export const lensManagementReducer = lensManagementSlice.reducer
