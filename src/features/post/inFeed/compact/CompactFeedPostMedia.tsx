import { ComponentProps } from "react";
import Media from "../../../media/gallery/Media";
import { PostView } from "lemmy-js-client";
import usePostSrc from "../usePostSrc";

export default function CompactFeedPostMedia(
  props: Omit<ComponentProps<typeof Media>, "src"> & { post: PostView },
) {
  const src = usePostSrc(props.post);

  if (src) return <Media {...props} src={src} />;
}
