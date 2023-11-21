import { forwardRef } from "react";
import { CustomItemComponentProps } from "virtua";

/**
 * Add data-index to each item for programatic scrolling
 */
export const IndexedVirtuaItem = forwardRef<
  HTMLDivElement,
  CustomItemComponentProps
>(({ children, index, style }, ref) => {
  return (
    <div ref={ref} style={style} data-index={index}>
      {children}
    </div>
  );
});
IndexedVirtuaItem.displayName = "IndexedVirtuaItem";
