export function formatNumber(number: number): string {
  if (number >= 1000) {
    const roundedNumber = Math.round(number / 100) / 10; // Round to nearest tenth
    const formattedNumber = roundedNumber.toFixed(1); // Format to 1 decimal place
    const suffix = "K";
    return formattedNumber + suffix;
  } else {
    return number.toString();
  }
}
