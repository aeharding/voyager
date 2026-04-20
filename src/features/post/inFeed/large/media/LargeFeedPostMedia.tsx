import { ComponentProps } from "react";
import { PostView } from "threadiverse";

import { isRedgif } from "#/features/media/external/redgifs/helpers";
import LargeFeedRedgifMedia from "#/features/media/external/redgifs/LargeFeedRedgifMedia";
import LargeFeedYoutubeMedia from "#/features/media/external/youtube/LargeFeedYoutubeMedia";
import { buildMediaId } from "#/features/media/video/VideoPortalProvider";
import { isYoutube } from "#/features/post/link/thumbnail/sites/youtube";
import { cx } from "#/helpers/css";

import usePostSrc from "../../usePostSrc";
import LargeFeedMedia from "./LargeFeedMedia";

import styles from "./LargeFeedPostMedia.module.css";

export default function LargeFeedPostMedia(
  props: Omit<ComponentProps<typeof LargeFeedMedia>, "src"> & {
    post: PostView;
  },
) {
  const src = usePostSrc(props.post);

  if (props.post.post.url) {
    switch (true) {
      case isRedgif(props.post.post.url):
        return (
          <LargeFeedRedgifMedia
            {...props}
            url={props.post.post.url}
            alt={props.post.post.alt_text}
            autoPlay={!props.blur}
            disableInlineInteraction={props.blur}
            className={cx(styles.lightbox, props.className)}
            portalWithMediaId={buildMediaId(props.post.post.ap_id)}
          />
        );
      case isYoutube(props.post.post.url):
        return (
          <LargeFeedYoutubeMedia
            url={props.post.post.url}
            blur={props.blur}
            className={cx(styles.lightbox, props.className)}
            style={props.style}
            onClick={props.onClick}
          />
        );
    }
  }

  if (src)
    return (
      <LargeFeedMedia
        {...props}
        src={src}
        autoPlay={!props.blur}
        disableInlineInteraction={props.blur}
        alt={props.post.post.alt_text}
        className={cx(styles.lightbox, props.className)}
        portalWithMediaId={buildMediaId(props.post.post.ap_id)}
      />
    );
}
