import { CustomItemComponentProps, VListHandle } from "virtua";

/**
 * Add data-index to each item for programmatic scrolling
 */
export function IndexedVirtuaItem({
  children,
  index,
  style,
  ref,
}: CustomItemComponentProps) {
  return (
    <div ref={ref} style={style} data-index={index}>
      {children}
    </div>
  );
}

/**
 * https://github.com/inokawa/virtua/releases/tag/0.47.0
 */
export function findStartIndex(virtuaRef: VListHandle) {
  return virtuaRef.findItemIndex(virtuaRef.scrollOffset);
}

/**
 * https://github.com/inokawa/virtua/releases/tag/0.47.0
 */
export function findEndIndex(virtuaRef: VListHandle) {
  return virtuaRef.findItemIndex(
    virtuaRef.scrollOffset + virtuaRef.viewportSize,
  );
}
