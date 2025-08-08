export type LensStatus =
  | 'in-use'
  | 'opened'
  | 'unopened'
  | 'taken-off'
  | 'expired'

export interface Lens {
  id: string
  manufacturer: string
  brand: string
  wearPeriodTitle: string
  wearPeriodDays: number
  usagePeriodDays: number
  discardDate: string | null
  status: LensStatus
  openedDate: string | null
  sphere: string
  baseCurveRadius: string
  // Total accumulated usage time across all sessions, in milliseconds
  accumulatedUsageMs?: number
  // When the lens was last put on the eye (start of the current session). Null if not currently in use
  lastResumedAt?: string | null
}

export interface LensManagementState {
  lenses: Lens[]
  currentLens: Lens | null
  isLoading: boolean
  error: string | null
}

export enum LensTypeByWearPeriodEnum {
  Daily = 'Ежедневные',
  TwoWeeks = 'Двухнедельные',
  Monthly = 'Ежемесячные'
}
