import { CustomItemComponentProps } from "virtua";

interface IndexedVirtuaItemProps extends CustomItemComponentProps {
  ref: React.RefObject<HTMLDivElement>;
}

/**
 * Add data-index to each item for programmatic scrolling
 */
export function IndexedVirtuaItem({
  children,
  index,
  style,
  ref,
}: IndexedVirtuaItemProps) {
  return (
    <div ref={ref} style={style} data-index={index}>
      {children}
    </div>
  );
}
