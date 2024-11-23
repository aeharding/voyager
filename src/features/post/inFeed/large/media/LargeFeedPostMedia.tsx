import { PostView } from "lemmy-js-client";
import { ComponentProps } from "react";

import LargeFeedRedgifMedia from "#/features/media/external/redgifs/LargeFeedRedgifMedia";
import { isRedgif } from "#/features/media/external/redgifs/helpers";

import usePostSrc from "../../usePostSrc";
import LargeFeedMedia from "./LargeFeedMedia";
import styles from "./LargeFeedPostMedia.module.css";

export default function LargeFeedPostMedia(
  props: Omit<ComponentProps<typeof LargeFeedMedia>, "src"> & {
    post: PostView;
  },
) {
  const src = usePostSrc(props.post);

  if (props.post.post.url && isRedgif(props.post.post.url))
    return (
      <LargeFeedRedgifMedia
        {...props}
        url={props.post.post.url}
        alt={props.post.post.alt_text}
        autoPlay={!props.blur}
        shouldPortal
      />
    );

  if (src)
    return (
      <LargeFeedMedia
        {...props}
        src={src}
        autoPlay={!props.blur}
        alt={props.post.post.alt_text}
        className={styles.lightbox}
        shouldPortal
      />
    );
}
