// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAllObjectValuesDeep(obj: any): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [];

  // Helper function to recursively traverse the object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function traverse(obj: any) {
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const value = obj[key];
        if (typeof value === "object" && value !== null) {
          traverse(value); // Recursively traverse nested objects
        } else {
          values.push(value); // Add non-object values to the result array
        }
      }
    }
  }

  traverse(obj);
  return values;
}
