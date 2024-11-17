import { PostView } from "lemmy-js-client";
import { ComponentProps } from "react";

import Media from "#/features/media/Media";

import usePostSrc from "../usePostSrc";

export default function CompactFeedPostMedia(
  props: Omit<ComponentProps<typeof Media>, "src" | "ref"> & { post: PostView },
) {
  const src = usePostSrc(props.post);

  if (src) return <Media {...props} src={src} alt={props.post.post.alt_text} />;
}
