import { LensTypeByWearPeriodEnum } from '@/app/store/slices/lens-management-slice';

export interface BrandWithWearPeriod {
  name: string;
  wearPeriod: LensTypeByWearPeriodEnum;
}

// Manufacturer -> list of brands with explicit wear period
export const MANUFACTURER_BRANDS_MAP: Record<string, BrandWithWearPeriod[]> = {
  'Johnson & Johnson': [
    { name: 'Acuvue Oasys', wearPeriod: LensTypeByWearPeriodEnum.TwoWeeks },
    { name: 'Acuvue Oasys 1-Day', wearPeriod: LensTypeByWearPeriodEnum.Daily },
    {
      name: 'Acuvue Oasys with Transitions',
      wearPeriod: LensTypeByWearPeriodEnum.TwoWeeks
    },
    { name: '1-Day Acuvue Moist', wearPeriod: LensTypeByWearPeriodEnum.Daily },
    { name: '1-Day Acuvue TruEye', wearPeriod: LensTypeByWearPeriodEnum.Daily },
    { name: 'Acuvue Vita', wearPeriod: LensTypeByWearPeriodEnum.Monthly }
  ],
  Alcon: [
    {
      name: 'Dailies AquaComfort Plus',
      wearPeriod: LensTypeByWearPeriodEnum.Daily
    },
    { name: 'Dailies Total1', wearPeriod: LensTypeByWearPeriodEnum.Daily },
    { name: 'Precision1', wearPeriod: LensTypeByWearPeriodEnum.Daily },
    { name: 'TOTAL30', wearPeriod: LensTypeByWearPeriodEnum.Monthly },
    {
      name: 'Air Optix plus Hydraglyde',
      wearPeriod: LensTypeByWearPeriodEnum.Monthly
    },
    { name: 'Air Optix Colors', wearPeriod: LensTypeByWearPeriodEnum.Monthly },
    {
      name: 'FreshLook Colorblends',
      wearPeriod: LensTypeByWearPeriodEnum.Monthly
    }
  ],
  CooperVision: [
    { name: 'Biofinity', wearPeriod: LensTypeByWearPeriodEnum.Monthly },
    { name: 'Biofinity Energys', wearPeriod: LensTypeByWearPeriodEnum.Monthly },
    { name: 'Clariti 1 day', wearPeriod: LensTypeByWearPeriodEnum.Daily },
    { name: 'MyDay', wearPeriod: LensTypeByWearPeriodEnum.Daily },
    { name: 'Avaira Vitality', wearPeriod: LensTypeByWearPeriodEnum.Monthly },
    { name: 'Proclear', wearPeriod: LensTypeByWearPeriodEnum.Monthly }
  ],
  'Bausch + Lomb': [
    { name: 'ULTRA', wearPeriod: LensTypeByWearPeriodEnum.Monthly },
    { name: 'ULTRA One Day', wearPeriod: LensTypeByWearPeriodEnum.Daily },
    { name: 'Biotrue ONEday', wearPeriod: LensTypeByWearPeriodEnum.Daily },
    {
      name: 'SofLens daily disposable',
      wearPeriod: LensTypeByWearPeriodEnum.Daily
    },
    { name: 'SofLens 59', wearPeriod: LensTypeByWearPeriodEnum.Monthly },
    { name: 'PureVision2', wearPeriod: LensTypeByWearPeriodEnum.Monthly }
  ],
  Menicon: [
    { name: 'Miru 1day', wearPeriod: LensTypeByWearPeriodEnum.Daily },
    { name: 'Miru 1day Flat Pack', wearPeriod: LensTypeByWearPeriodEnum.Daily },
    { name: 'Miru 1month', wearPeriod: LensTypeByWearPeriodEnum.Monthly },
    { name: 'PremiO', wearPeriod: LensTypeByWearPeriodEnum.Monthly }
  ]
};

// Flattened brand -> wear period map (case-insensitive by using lowercase keys)
export const BRAND_TO_WEAR_PERIOD_MAP: Record<
  string,
  LensTypeByWearPeriodEnum
> = Object.values(MANUFACTURER_BRANDS_MAP)
  .flat()
  .reduce(
    (acc, { name, wearPeriod }) => {
      acc[name.trim().toLowerCase()] = wearPeriod;
      return acc;
    },
    {} as Record<string, LensTypeByWearPeriodEnum>
  );

// Direct lookup by brand name; returns one of:
// 'Ежедневные' | 'Двухнедельные' | 'Ежемесячные' | null
export const inferWearPeriodTitleForBrand = (
  brandRaw: string
): string | null => {
  const key = (brandRaw || '').trim().toLowerCase();
  if (!key) return null;
  return BRAND_TO_WEAR_PERIOD_MAP[key] ?? null;
};
