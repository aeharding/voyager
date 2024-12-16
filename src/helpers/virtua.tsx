import { CustomItemComponentProps } from "virtua";

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
