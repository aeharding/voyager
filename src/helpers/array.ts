import { pullAt } from "lodash";

export function notEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

// https://stackoverflow.com/a/60132060/1319878
export const arrayOfAll =
  <T>() =>
  <U extends T[]>(array: U & ([T] extends [U[number]] ? unknown : "Invalid")) =>
    array;

export function moveItem<T>(array: T[], from: number, to: number): T[] {
  const clonedArray = [...array];
  const [itemToMove] = pullAt(clonedArray, from);
  if (!itemToMove) return array;
  clonedArray.splice(to, 0, itemToMove);
  return clonedArray;
}
