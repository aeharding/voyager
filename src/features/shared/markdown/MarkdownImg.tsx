import InlineMedia, { InlineMediaProps } from "#/features/media/InlineMedia";
import { cx } from "#/helpers/css";

import styles from "./MarkdownImg.module.css";

interface MarkdownImgProps extends Omit<InlineMediaProps, "ref"> {
  /**
   * Restrict height of media within comments (unrestricted in post body)
   */
  small?: boolean;
}

export default function MarkdownImg({
  small,
  src,
  ...props
}: MarkdownImgProps) {
  const sharedStyles = small ? styles.small : undefined;

  if (!src) return;

  return (
    <InlineMedia
      {...props}
      src={src}
      mediaClassName={cx(sharedStyles, props.className)}
      className={styles.media}
      animationType="zoom"
      progress={false}
      volume={false}
    />
  );
}
