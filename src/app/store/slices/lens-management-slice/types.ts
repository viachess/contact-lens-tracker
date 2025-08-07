export interface Lens {
  id: string
  manufacturer: string
  brand: string
  wearPeriodTitle: string
  wearPeriodDays: number
  usagePeriodDays: number
  discardDate: string | null
  status: string
  openedDate: string | null
  sphere: string
  baseCurveRadius: string
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
