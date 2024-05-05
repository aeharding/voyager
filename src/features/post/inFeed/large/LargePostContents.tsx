import { styled } from "@linaria/react";
import { css } from "@linaria/core";
import { PostView } from "lemmy-js-client";
import { useContext, useMemo } from "react";
import { findLoneImage } from "../../../../helpers/markdown";
import { useAppSelector } from "../../../../store";
import { isNsfwBlurred } from "../../../labels/Nsfw";
import LargeFeedPostMedia from "./media/LargeFeedPostMedia";
import InlineMarkdown from "../../../shared/markdown/InlineMarkdown";
import { InFeedContext } from "../../../feed/Feed";
import useIsPostUrlMedia from "../../useIsPostUrlMedia";
import PostLink from "../../link/PostLink";

// This is needed to hide NSFW messaging, etc when image is open
export const LARGE_POST_MEDIA_CONTAINER_CLASSNAME =
  "large-post-media-container";
export const LARGE_POST_MEDIA_CONTAINER_HIDDEN_CLASSNAME = "hidden";

const PostBody = styled.div`
  font-size: 0.8em;
  line-height: 1.25;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &:empty {
    display: none;
  }
`;

const postBodyReadCss = css`
  color: var(--read-color-medium);
`;

const postBodyUnreadCss = css`
  opacity: 0.6;
`;

const ImageContainer = styled.div`
  overflow: hidden;
  margin: 0 -12px;

  &.${LARGE_POST_MEDIA_CONTAINER_HIDDEN_CLASSNAME} {
    img {
      visibility: hidden;
    }
  }
`;

interface LargePostContentsProps {
  post: PostView;
}

export default function LargePostContents({ post }: LargePostContentsProps) {
  const inFeed = useContext(InFeedContext);

  const hasBeenRead: boolean =
    useAppSelector((state) => state.post.postReadById[post.post.id]) ||
    post.read;
  const markdownLoneImage = useMemo(
    () => (post.post.body ? findLoneImage(post.post.body) : undefined),
    [post],
  );
  const blurNsfw = useAppSelector(
    (state) => state.settings.appearance.posts.blurNsfw,
  );

  const isPostUrlMedia = useIsPostUrlMedia();
  const urlIsMedia = useMemo(
    () => isPostUrlMedia(post),
    [post, isPostUrlMedia],
  );

  if (urlIsMedia || markdownLoneImage) {
    return (
      <ImageContainer className={LARGE_POST_MEDIA_CONTAINER_CLASSNAME}>
        <LargeFeedPostMedia
          blur={inFeed ? isNsfwBlurred(post, blurNsfw) : false}
          post={post}
          animationType="zoom"
        />
      </ImageContainer>
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

        <PostBody className={hasBeenRead ? postBodyReadCss : postBodyUnreadCss}>
          <InlineMarkdown>{post.post.body}</InlineMarkdown>
        </PostBody>
      </>
    );
  }

  if (post.post.url) {
    return <PostLink post={post} />;
  }
}
