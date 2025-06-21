import { ComponentProps } from "react";
import { PostView } from "threadiverse";

import GalleryMedia from "#/features/media/gallery/GalleryMedia";

import usePostSrc from "../usePostSrc";

export default function CompactFeedPostMedia(
  props: Omit<ComponentProps<typeof GalleryMedia>, "src" | "ref"> & {
    post: PostView;
  },
) {
  const src = usePostSrc(props.post);

  if (src)
    return (
      <GalleryMedia
        {...props}
        src={src}
        alt={props.post.post.alt_text}
        allowShowPlayButton={false}
        disableInlineInteraction
        controls={false}
        volume={false}
        autoPlay={false}
      />
    );
}
