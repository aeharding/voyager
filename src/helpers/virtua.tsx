import { useMergedRef } from "@mantine/hooks";
import { CustomItemComponentProps, VListHandle } from "virtua";
import { Virtualizer, VList } from "virtua";

import { useAppPageVListHandleRef } from "./AppPage";

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

export function AppVList({
  ref,
  ...props
}: React.ComponentProps<typeof VList>) {
  const virtuaRef = useAppPageVListHandleRef();

  return <VList {...props} ref={useMergedRef(virtuaRef, ref)} />;
}

export function AppVirtualizer({
  ref,
  ...props
}: React.ComponentProps<typeof Virtualizer>) {
  const virtuaRef = useAppPageVListHandleRef();

  return <Virtualizer {...props} ref={useMergedRef(virtuaRef, ref)} />;
}
