export function insert(str: string, index: number, value: string) {
  return str.substr(0, index) + value + str.substr(index);
}
