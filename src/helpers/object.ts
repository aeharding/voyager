import { isUndefined, omitBy } from "lodash";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function omitUndefinedValues<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  return omitBy(obj, isUndefined) as Partial<T>;
}
