import { Lens } from './types';
import { nanoid } from 'nanoid';

export const mockLensesList: Lens[] = [
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
    openedDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    sphere: '-4.5',
    baseCurveRadius: '8.6',
    accumulatedUsageMs: 6 * 60 * 60 * 1000,
    lastResumedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: nanoid(5),
    manufacturer: 'Johnson & Johnson',
    brand: 'Acuvue Oasys',
    wearPeriodTitle: 'Двухнедельные',
    wearPeriodDays: 14,
    usagePeriodDays: 0,
    discardDate: null,
    status: 'unopened',
    openedDate: null,
    sphere: '-2.25',
    baseCurveRadius: '8.4',
    accumulatedUsageMs: 0,
    lastResumedAt: null
  },
  {
    id: nanoid(5),
    manufacturer: 'Alcon',
    brand: 'Air Optix',
    wearPeriodTitle: 'Месячные',
    wearPeriodDays: 30,
    usagePeriodDays: 0,
    discardDate: null,
    status: 'unopened',
    openedDate: null,
    sphere: '-1.50',
    baseCurveRadius: '8.6',
    accumulatedUsageMs: 0,
    lastResumedAt: null
  }
];
