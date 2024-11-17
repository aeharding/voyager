import { css, cx } from "@linaria/core";

import StableSizeMedia from "#/features/media/StableSizeMedia";
import { GalleryMediaProps } from "#/features/media/gallery/GalleryMedia";

const smallStyles = css`
  max-height: 200px;
`;

const mediaStyles = css`
  display: inline-flex;

  &.not-loaded {
    height: 200px;
    border: 1px solid rgba(100, 100, 100, 0.2);
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
    <StableSizeMedia
      {...props}
      src={src}
      nativeElmClassName={cx(sharedStyles, props.className)}
      className={mediaStyles}
      animationType="zoom"
    />
  );
}
