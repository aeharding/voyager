import Media, { MediaProps } from "#/features/media/Media";

import BlurOverlay from "./BlurOverlay";

import styles from "./LargeFeedMedia.module.css";

interface LargeFeedMediaProps extends MediaProps {
  blur?: boolean;
}

export default function LargeFeedMedia({
  blur,
  ...props
}: LargeFeedMediaProps) {
  const contents = <Media {...props} mediaClassName={styles.fullWidthPost} />;

  if (!blur) return contents;

  return <BlurOverlay src={props.src}>{contents}</BlurOverlay>;
}
