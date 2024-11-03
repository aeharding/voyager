import { css, cx } from "@linaria/core";
import { useMemo } from "react";

import GalleryMedia, {
  GalleryMediaProps,
} from "#/features/media/gallery/GalleryMedia";
import Player from "#/features/media/video/Player";
import { isUrlVideo } from "#/helpers/url";

const smallStyles = css`
  max-height: 200px;
`;

interface MarkdownImgProps extends Omit<GalleryMediaProps, "ref"> {
  /**
   * Restrict height of media within comments (unrestricted in post body)
   */
  small?: boolean;
}

export default function MarkdownImg({ small, ...props }: MarkdownImgProps) {
  const sharedStyles = small ? smallStyles : undefined;
  const isVideo = useMemo(
    () => props.src && isUrlVideo(props.src),
    [props.src],
  );

  if (isVideo)
    return (
      <Player
        src={props.src!}
        progress={false}
        volume={false}
        className={cx(sharedStyles, props.className)}
        nativeControls={!small}
        {...props}
      />
    );

  return (
    <GalleryMedia
      {...props}
      className={cx(sharedStyles, props.className)}
      animationType="zoom"
    />
  );
}
