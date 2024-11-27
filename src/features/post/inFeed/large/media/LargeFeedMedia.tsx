import InlineMedia, { InlineMediaProps } from "#/features/media/InlineMedia";

import BlurOverlay from "./BlurOverlay";

import styles from "./LargeFeedMedia.module.css";

interface LargeFeedMediaProps extends InlineMediaProps {
  blur?: boolean;
}

export default function LargeFeedMedia({
  blur,
  ...props
}: LargeFeedMediaProps) {
  const contents = (
    <InlineMedia {...props} mediaClassName={styles.fullWidthPost} />
  );

  if (!blur) return contents;

  return <BlurOverlay src={props.src}>{contents}</BlurOverlay>;
}
