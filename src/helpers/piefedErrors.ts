export function isPiefedError(error: unknown, errorMessage: string) {
  if (!(error instanceof Error)) return;

  return error.message === errorMessage;
}
