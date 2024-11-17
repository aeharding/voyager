import { CustomItemComponentProps } from "virtua";

/**
 * Add data-index to each item for programmatic scrolling
 */
export function IndexedVirtuaItem({
  index,
  ...rest
}: CustomItemComponentProps) {
  return <div data-index={index} {...rest} />;
}
