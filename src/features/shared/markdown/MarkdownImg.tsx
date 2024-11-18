import { css, cx } from "@linaria/core";

import InlineMedia from "#/features/media/InlineMedia";
import { GalleryMediaProps } from "#/features/media/gallery/GalleryMedia";

const smallStyles = css`
  max-height: 200px;
`;

const mediaStyles = css`
  display: inline-flex;
  vertical-align: middle;

  &.not-loaded {
    height: 200px;
    border: 1px solid rgba(var(--ion-color-dark-rgb), 0.15);
  }
`;

interface MarkdownImgProps extends Omit<GalleryMediaProps, "ref"> {
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
  const sharedStyles = small ? smallStyles : undefined;

  if (!src) return;

  return (
    <InlineMedia
      {...props}
      src={src}
      mediaClassName={cx(sharedStyles, props.className)}
      className={mediaStyles}
      animationType="zoom"
      progress={false}
      volume={false}
      shouldPortal={false}
    />
  );
}
