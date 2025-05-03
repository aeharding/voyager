import Media, { MediaProps } from "#/features/media/Media";
import { cx } from "#/helpers/css";
import { forceSecureUrl } from "#/helpers/url";

import styles from "./MarkdownImg.module.css";

interface MarkdownImgProps extends Omit<MediaProps, "ref"> {
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
    <Media
      {...props}
      src={forceSecureUrl(src)}
      mediaClassName={cx(sharedStyles, props.className)}
      className={styles.media}
      animationType="zoom"
      progress={false}
      volume={false}
    />
  );
}
