export function formatNumber(
  number: number,
  roundingThreshold = 1_000,
): string {
  if (number < roundingThreshold) return number.toLocaleString();

  if (number < 1_000_000) {
    const roundedNumber = Math.round(number / 100) / 10; // Round to nearest tenth
    if (roundedNumber === 1_000) return "1.0M"; // Handle edge case
    const formattedNumber = roundedNumber.toFixed(1); // Format to 1 decimal place
    const suffix = "K";
    return formattedNumber + suffix;
  }

  const roundedNumber = Math.round(number / 100_000) / 10; // Round to nearest tenth
  const formattedNumber = roundedNumber.toFixed(1); // Format to 1 decimal place
  const suffix = "M";
  return formattedNumber + suffix;
}
