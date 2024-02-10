import { useMemo } from "react";
import { isUrlVideo } from "../../helpers/url";
import Player from "../media/video/Player";
import { css } from "@emotion/react";
import GalleryMedia, { GalleryMediaProps } from "../media/gallery/GalleryMedia";

const smallStyles = css`
  max-height: 200px;
`;

interface MarkdownImgProps extends GalleryMediaProps {
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
        css={sharedStyles}
        nativeControls={!small}
        {...props}
      />
    );

  return <GalleryMedia {...props} css={sharedStyles} animationType="zoom" />;
}
