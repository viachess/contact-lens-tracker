import { LensTypeByWearPeriodEnum } from './types';

/**
 * Wear periods (in days) for each lens type.
 */

export const lensTypeToWearPeriodMap = {
  [LensTypeByWearPeriodEnum.Daily]: 1,
  [LensTypeByWearPeriodEnum.TwoWeeks]: 14,
  [LensTypeByWearPeriodEnum.Monthly]: 30
};
