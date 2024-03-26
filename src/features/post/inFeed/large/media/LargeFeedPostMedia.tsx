import { getPostMedia } from "../../../../media/gallery/Media";
import { ComponentProps, useMemo } from "react";
import LargeFeedMedia from "./LargeFeedMedia";
import LargeFeedRedgifMedia from "../../../../media/external/redgifs/LargeFeedRedgifMedia";
import { isRedgif } from "../../../../media/external/redgifs/helpers";
import { PostView } from "lemmy-js-client";

export default function LargeFeedPostMedia(
  props: Omit<ComponentProps<typeof LargeFeedMedia>, "src"> & {
    post: PostView;
  },
) {
  const src = useMemo(() => getPostMedia(props.post), [props.post]);

  if (props.post.post.url && isRedgif(props.post.post.url))
    return <LargeFeedRedgifMedia url={props.post.post.url} {...props} />;

  if (src) return <LargeFeedMedia {...props} src={src} />;
}
