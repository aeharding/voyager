// https://stackoverflow.com/a/60132060/1319878
export const arrayOfAll =
  <T>() =>
  <U extends T[]>(array: U & ([T] extends [U[number]] ? unknown : "Invalid")) =>
    array;

export function moveItem<T>(array: T[], from: number, to: number): T[] {
  const itemToMove = array[from];
  if (itemToMove === undefined) return array;

  const arrayCopy = [...array];
  arrayCopy.splice(from, 1);
  arrayCopy.splice(to, 0, itemToMove);
  return arrayCopy;
}

/**
 * This function provides a sort function that will pull referenceArray values to the front,
 * in the order of referenceArray, if the values exists.
 *
 * @param referenceArray Array of values that should be pulled to front of array (in order), if exist
 * @param by Map function to compare elements of array to sort to referenceArray values
 * @returns Sort function
 */
export function buildPrioritizeAndSortFn<A, B>(
  referenceArray: A[],
  by: (el: B) => A,
) {
  const customSort = (a: A, b: A) => {
    const indexA = referenceArray.indexOf(a);
    const indexB = referenceArray.indexOf(b);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    if (indexA !== -1) {
      return -1;
    }

    if (indexB !== -1) {
      return 1;
    }

    return 0;
  };

  return (a: B, b: B) => customSort(by(a), by(b));
}
