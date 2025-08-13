import { LensTypeByWearPeriodEnum } from '@/app/store/slices/lens-management-slice'

export const MANUFACTURER_BRANDS_MAP: Record<string, string[]> = {
  'Johnson & Johnson': [
    'Acuvue Oasys',
    'Acuvue Oasys 1-Day',
    'Acuvue Oasys with Transitions',
    '1-Day Acuvue Moist',
    '1-Day Acuvue TruEye',
    'Acuvue Vita'
  ],
  Alcon: [
    'Dailies AquaComfort Plus',
    'Dailies Total1',
    'Precision1',
    'TOTAL30',
    'Air Optix plus Hydraglyde',
    'Air Optix Colors',
    'FreshLook Colorblends'
  ],
  CooperVision: [
    'Biofinity',
    'Biofinity Energys',
    'Clariti 1 day',
    'MyDay',
    'Avaira Vitality',
    'Proclear'
  ],
  'Bausch + Lomb': [
    'ULTRA',
    'ULTRA One Day',
    'Biotrue ONEday',
    'SofLens daily disposable',
    'SofLens 59',
    'PureVision2'
  ],
  Menicon: ['Miru 1day', 'Miru 1day Flat Pack', 'Miru 1month', 'PremiO']
}

// Heuristic wear-period inference based on brand naming
// Returns one of: 'Ежедневные' | 'Двухнедельные' | 'Ежемесячные' | null
export const inferWearPeriodTitleForBrand = (
  brandRaw: string
): string | null => {
  const brand = (brandRaw || '').toLowerCase()
  if (!brand) return null

  // Daily lenses indicators
  const dailyHints = [
    '1-day',
    '1 day',
    'oneday',
    'one day',
    'daily',
    'dailies',
    'oneday',
    'one-day',
    'moist',
    'tru eye',
    'trueye',
    'one day'
  ]
  if (dailyHints.some((h) => brand.includes(h)))
    return LensTypeByWearPeriodEnum.Daily

  // Two weeks indicators
  const twoWeeksHints = ['two week', '2 week', '2-week', 'двухнедель']
  if (twoWeeksHints.some((h) => brand.includes(h)))
    return LensTypeByWearPeriodEnum.TwoWeeks

  // Monthly indicators
  const monthlyHints = [
    '30',
    'month',
    'monthly',
    'месяч',
    'vita',
    'air optix',
    'miru 1month',
    'total30'
  ]
  if (monthlyHints.some((h) => brand.includes(h)))
    return LensTypeByWearPeriodEnum.Monthly

  return null
}
