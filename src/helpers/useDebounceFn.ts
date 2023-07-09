import * as React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useDebounceFn<T extends (...args: any) => any>(
  fn: T,
  delay: number
): T {
  const timeoutId = React.useRef<number | undefined>();
  const originalFn = React.useRef<T | null>(null);

  React.useEffect(() => {
    originalFn.current = fn;
    return () => {
      originalFn.current = null;
    };
  }, [fn]);

  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutId.current);
    };
  }, []);

  return React.useMemo<T>(
    () =>
      ((...args: unknown[]) => {
        clearTimeout(timeoutId.current);

        timeoutId.current = window.setTimeout(() => {
          if (originalFn.current) {
            originalFn.current(...args);
          }
        }, delay);
      }) as unknown as T,
    [delay]
  );
}
