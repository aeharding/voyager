import { ComponentProps, useMemo } from "react";
import Media, { getPostMedia } from "../../../media/gallery/Media";
import { PostView } from "lemmy-js-client";

export default function CompactFeedPostMedia({
  post,
  ...rest
}: Omit<ComponentProps<typeof Media>, "src"> & { post: PostView }) {
  const src = useMemo(() => getPostMedia(post), [post]);

  if (src) return <Media src={src} {...rest} />;
}
