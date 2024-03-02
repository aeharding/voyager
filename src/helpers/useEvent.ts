import { useCallback, useLayoutEffect, useRef } from "react";

// *pokes react*
// cmon, do something
// this should be added in react 19, I think?
// https://github.com/reactjs/rfcs/blob/d85e257502a43c08d17e8ab58efa0880f7f007a5/text/0000-useevent.md#internal-implementation

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useEvent<T extends (...args: any[]) => any>(
  handler: T,
) {
  const handlerRef = useRef<T | null>(null);

  // In a real implementation, this would run before layout effects
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback<(...args: Parameters<T>) => ReturnType<T>>((...args) => {
    // In a real implementation, this would throw if called during render
    const fn = handlerRef.current!;
    return fn(...args);
  }, []);
}
