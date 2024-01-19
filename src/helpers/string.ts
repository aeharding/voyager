export function insert(
  str: string,
  index: number,
  insertedText: string,
  removeLength = 0,
) {
  return str.slice(0, index) + insertedText + str.slice(index + removeLength);
}
