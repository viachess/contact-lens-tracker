import { isValidDate } from './is-valid-date';

// convert string date to Date object
export const parseDate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isValidDate(date)) return date;
  throw new Error(`Invalid date: ${dateString}`);
};
