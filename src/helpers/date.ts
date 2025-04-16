import {
  differenceInDays,
  getYear,
  isSameDay,
  isSameYear,
  setYear,
} from "date-fns";

// Returns a date in local time with the same year, month and day. Ignores the
// source timezone. The goal is to show the same date in all timezones.
export function cakeDate(date: string): Date {
  const year = +date.slice(0, 4);
  const month = +date.slice(5, 7);
  const day = +date.slice(8, 10);

  return new Date(year, month - 1, day);
}

/**
 * User cake day happens annually, and starts the exact millisecond the user
 * signed up, and runs for exactly 24 hours
 *
 * @author https://github.com/LemmyNet/lemmy-ui/blob/0307ec4834f61b8d843fd9d4022a8332159d70ae/src/shared/utils/helpers/is-cake-day.ts#L9
 * @param creationDate User created date
 * @returns True if cake day! 🍰
 */
export function calculateIsCakeDay(published: string): boolean {
  const createDate = cakeDate(published);
  const currentDate = new Date();

  // The day-overflow of Date makes leap days become 03-01 in non leap years.
  return (
    isSameDay(currentDate, setYear(createDate, getYear(currentDate))) &&
    !isSameYear(currentDate, createDate)
  );
}

/**
 * Determine if a Lemmy user is newly created
 *
 * @param creationDate User created date
 * @returns age of the account in days (if found)
 */
export function calculateNewAccount(published: string): number | undefined {
  const creation = cakeDate(published);
  const days = differenceInDays(new Date(), creation);

  if (days < 0 || days > 30) return;

  return days;
}
