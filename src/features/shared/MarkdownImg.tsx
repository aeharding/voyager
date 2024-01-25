import { HTMLProps, useMemo } from "react";
import { isUrlVideo } from "../../helpers/url";
import GalleryImg, { GalleryImgProps } from "../gallery/GalleryImg";
import Video from "./Video";
import { css } from "@emotion/react";

const smallStyles = css`
  max-height: 200px;
`;

interface MarkdownImgProps
  extends Omit<HTMLProps<HTMLImageElement>, "ref">,
    GalleryImgProps {
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

  return <GalleryImg {...props} css={sharedStyles} animationType="zoom" />;
}
