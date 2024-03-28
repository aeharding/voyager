import { ComponentProps, useMemo } from "react";
import Media, { getPostMedia } from "../../../media/gallery/Media";
import { PostView } from "lemmy-js-client";

export default function CompactFeedPostMedia(
  props: Omit<ComponentProps<typeof Media>, "src"> & { post: PostView },
) {
  const src = useMemo(() => getPostMedia(props.post), [props.post]);

  if (src) return <Media {...props} src={src} />;
}
