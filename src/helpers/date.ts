/**
 * Lemmy <= 0.18.3 has a bug where the Z isn't appended
 *
 * @param rawLemmyDateString Bugged lemmy date string
 * @returns Consistent date string, ready to be passed to Date
 */
export function fixLemmyDateString(rawLemmyDateString: string): string {
  if (rawLemmyDateString.endsWith("Z")) return rawLemmyDateString;

  return `${rawLemmyDateString}Z`;
}
