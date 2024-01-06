import { PostView } from "lemmy-js-client";
import { useMemo } from "react";
import { findLoneImage } from "../../../../helpers/markdown";
import { useAppSelector } from "../../../../store";
import { isUrlMedia } from "../../../../helpers/url";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { isNsfwBlurred } from "../../../labels/Nsfw";
import Media from "./media/Media";
import Embed from "../../shared/Embed";
import InlineMarkdown from "../../../shared/InlineMarkdown";

const PostBody = styled.div<{ isRead: boolean }>`
  font-size: 0.8em;
  line-height: 1.25;

  ${({ isRead }) =>
    isRead
      ? css`
          color: var(--read-color-medium);
        `
      : css`
          opacity: 0.6;
        `}

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ImageContainer = styled.div`
  overflow: hidden;
  margin: 0 -12px;
`;

interface LargePostContentsProps {
  post: PostView;
  inFeed?: boolean;
}

export default function LargePostContents({
  post,
  inFeed = true,
}: LargePostContentsProps) {
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

  if ((post.post.url && isUrlMedia(post.post.url)) || markdownLoneImage) {
    return (
      <ImageContainer>
        <Media
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
    return <Embed post={post} inFeed={inFeed} />;
  }

  /**
   * text image with captions
   */
  if (post.post.body) {
    return (
      <>
        {post.post.url && <Embed post={post} inFeed={inFeed} />}

        <PostBody isRead={hasBeenRead}>
          <InlineMarkdown>{post.post.body}</InlineMarkdown>
        </PostBody>
      </>
    );
  }

  if (post.post.url) {
    return <Embed post={post} inFeed={inFeed} />;
  }
}
