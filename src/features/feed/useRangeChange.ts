import { useThrottledCallback } from "@mantine/hooks";
import { useRef } from "react";
import { VListHandle } from "virtua";

export function useRangeChange(
  virtuaHandleRef: React.RefObject<VListHandle | null>,
  onRangeChange: (startIndex: number, endIndex: number) => void,
) {
  const startIndexRef = useRef(-1);
  const endIndexRef = useRef(-1);

  return useThrottledCallback(function onScroll() {
    const virtuaHandle = virtuaHandleRef.current;

    if (!virtuaHandle) return;

    const startIndex = virtuaHandle.findStartIndex();
    const endIndex = virtuaHandle.findEndIndex();

    if (
      startIndex !== startIndexRef.current ||
      endIndex !== endIndexRef.current
    ) {
      onRangeChange(startIndex, endIndex);
    }
    startIndexRef.current = startIndex;
    endIndexRef.current = endIndex;
  }, 200);
}
