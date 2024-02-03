import { useMemo } from "react";
import { isUrlVideo } from "../../helpers/url";
import Video from "./Video";
import { css } from "@emotion/react";
import GalleryMedia, { GalleryMediaProps } from "../gallery/GalleryMedia";

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
      <Video
        src={props.src!}
        progress={false}
        css={sharedStyles}
        controls={!small}
        {...props}
      />
    );

  return <GalleryMedia {...props} css={sharedStyles} animationType="zoom" />;
}
