import { HTMLProps } from "react";
import { isUrlVideo } from "../../helpers/url";
import { GalleryImg, GalleryImgProps } from "../gallery/GalleryImg";
import Video from "./Video";
import { css } from "@emotion/react";

const smallStyles = css`
  max-width: 200px;
`;

interface MarkdownImgProps
  extends HTMLProps<HTMLImageElement>,
    GalleryImgProps {
  /**
   * Restrict height of media within comments (unrestricted in post body)
   */
  small?: boolean;
}

export default function MarkdownImg({ small, ...props }: MarkdownImgProps) {
  const sharedStyles = small ? smallStyles : undefined;

  if (props.src && isUrlVideo(props.src))
    return (
      <Video src={props.src} progress={false} css={sharedStyles} {...props} />
    );

  return <GalleryImg {...props} css={sharedStyles} animationType="zoom" />;
}
