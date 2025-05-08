import { PostView } from "lemmy-js-client";
import { use, useMemo } from "react";

import { InFeedContext } from "#/features/feed/Feed";
import { isNsfwBlurred } from "#/features/labels/Nsfw";
import PostLink from "#/features/post/link/PostLink";
import InlineMarkdown from "#/features/shared/markdown/InlineMarkdown";
import { cx } from "#/helpers/css";
import { useAppSelector } from "#/store";

import useIsPostUrlMedia from "../../useIsPostUrlMedia";
import LargeFeedPostMedia from "./media/LargeFeedPostMedia";

import styles from "./LargePostContents.module.css";

// This is needed to hide NSFW messaging, etc when image is open
export const LARGE_POST_MEDIA_CONTAINER_CLASSNAME =
  "large-post-media-container";

interface LargePostContentsProps {
  post: PostView;
}

export default function LargePostContents({ post }: LargePostContentsProps) {
  const inFeed = use(InFeedContext);

  const hasBeenRead: boolean =
    useAppSelector((state) => state.post.postReadById[post.post.id]) ||
    post.read;
  const blurNsfw = useAppSelector(
    (state) => state.settings.appearance.posts.blurNsfw,
  );

  const isPostUrlMedia = useIsPostUrlMedia();
  const urlIsMedia = useMemo(
    () => isPostUrlMedia(post),
    [post, isPostUrlMedia],
  );

  if (urlIsMedia) {
    return (
      <div
        className={cx(
          styles.imageContainer,
          LARGE_POST_MEDIA_CONTAINER_CLASSNAME,
        )}
      >
        <LargeFeedPostMedia
          blur={inFeed ? isNsfwBlurred(post, blurNsfw) : false}
          post={post}
          animationType="zoom"
        />
      </div>
    );
  }

  /**
   * Embedded video, image with a thumbanil
   */
  if (post.post.thumbnail_url && post.post.url) {
    return <PostLink post={post} />;
  }

  /**
   * text image with captions
   */
  if (post.post.body?.trim()) {
    return (
      <>
        {post.post.url && <PostLink post={post} />}

        <div
          className={cx(styles.body, hasBeenRead ? styles.read : styles.unread)}
        >
          <InlineMarkdown>{post.post.body}</InlineMarkdown>
        </div>
      </>
    );
  }

  if (post.post.url) {
    return <PostLink post={post} />;
  }
}
