export function isPromiseResolvedByPaint(
  promise: Promise<unknown>,
): Promise<boolean> {
  return Promise.race([
    promise.then(() => true),
    new Promise<false>((resolve) => {
      requestAnimationFrame(() => {
        resolve(false);
      });
    }),
    // If promise rejected, it's still resolved by paint
  ]).catch(() => true);
}
