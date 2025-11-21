import { getEndOfLocalDay, parseDate } from '@/shared/lib';
import { Lens } from '../types';
import { isLensExpired } from './is-lens-expired';
import { calculateTotalUsageMs } from './calculate-total-usage-ms';

export const getRemainingHours = (lens: Lens | null): number | null => {
  if (!lens || !lens.openedDate) return null;
  if (lens.wearPeriodDays === 1) {
    const opened = parseDate(lens.openedDate);
    if (!opened) return null;
    if (isLensExpired(lens)) return 0;
    const endOfDay = getEndOfLocalDay(opened);
    const now = new Date();
    const remainingMs = Math.max(0, endOfDay.getTime() - now.getTime());
    return Math.ceil(remainingMs / (60 * 60 * 1000));
  }
  const totalUsageMs = calculateTotalUsageMs(lens);
  const msPerDay = 24 * 60 * 60 * 1000;
  const usedDays = Math.floor(totalUsageMs / msPerDay);
  const usedMsIntoDay = totalUsageMs - usedDays * msPerDay;
  const remainingDays = Math.max(0, lens.wearPeriodDays - usedDays);
  if (remainingDays <= 0) return 0;
  const remainingMsInCurrentDay = msPerDay - usedMsIntoDay;
  return Math.ceil(remainingMsInCurrentDay / (60 * 60 * 1000));
};
