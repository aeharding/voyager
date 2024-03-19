import { differenceInDays } from "date-fns";

/**
 * User cake day happens annually, and starts the exact millisecond the user
 * signed up, and runs for exactly 24 hours
 *
 * @param creationDate User created date
 * @returns True if cake day! 🍰
 */
export function calculateIsCakeDay(creationDate: Date) {
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

  const currentUTCDate = new Date();
  const userCreationUTCDate = new Date(creationDate);

  if (
    currentUTCDate.getTime() - userCreationUTCDate.getTime() <=
    oneDayInMilliseconds
  )
    // User was just created
    return false;

  // Set the year of the Cake Day to the current year
  userCreationUTCDate.setUTCFullYear(currentUTCDate.getUTCFullYear());

  // Check if the current UTC date is within a 24-hour window from the user's creation date
  const cakeDayStart = new Date(userCreationUTCDate);
  const cakeDayEnd = new Date(
    userCreationUTCDate.getTime() + oneDayInMilliseconds,
  );

  return currentUTCDate >= cakeDayStart && currentUTCDate < cakeDayEnd;
}

/**
 * Determine if a Lemmy user is newly created
 *
 * @param creationDate User created date
 * @returns age of the account in days (if found)
 */
export function calculateNewAccount(creationDate: Date): number | undefined {
  const days = differenceInDays(new Date(), creationDate);

  if (days < 0 || days > 30) return;

  return days;
}
