export function presentErrorMessage(message: string, error: unknown): string {
  if (error instanceof Error) {
    return `${message}: ${error.message}`;
  } else {
    return `${message}. Please try again.`;
  }
}
