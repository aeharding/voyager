import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { megaphone } from "ionicons/icons";
import PreviewStats from "../PreviewStats";
import Embed from "../../shared/Embed";
import { useMemo } from "react";
import { findLoneImage } from "../../../../helpers/markdown";
import { isUrlImage, isUrlVideo } from "../../../../helpers/lemmy";
import { maxWidthCss } from "../../../shared/AppContent";
import Nsfw, { isNsfw, isNsfwBlurred } from "../../../labels/Nsfw";
import { VoteButton } from "../../shared/VoteButton";
import MoreActions from "../../shared/MoreActions";
import PersonLink from "../../../labels/links/PersonLink";
import InlineMarkdown from "../../../shared/InlineMarkdown";
import { AnnouncementIcon } from "../../../../pages/posts/PostPage";
import CommunityLink from "../../../labels/links/CommunityLink";
import Video from "../../../shared/Video";
import { PostProps } from "../Post";
import Save from "../../../labels/Save";
import { Image } from "./Image";
import { useAppSelector } from "../../../../store";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.75rem;
  padding: 0.75rem;

  position: relative;

  ${maxWidthCss}
`;

const Title = styled.div<{ isRead: boolean }>`
  ${({ isRead }) =>
    isRead &&
    css`
      color: var(--read-color);
    `}
`;

const Details = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-size: 0.8em;
  color: var(--ion-color-text-aside);
`;

const LeftDetails = styled.div<{ isRead: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  min-width: 0;

  ${({ isRead }) =>
    isRead &&
    css`
      color: var(--read-color-medium);
    `}
`;

const RightDetails = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.5rem;

  > * {
    padding: 0.5rem !important;
  }
`;

const CommunityName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PostBody = styled.div<{ isRead: boolean }>`
  font-size: 0.875em;
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
  margin: 0 -0.75rem;
`;

export default function LargePost({ post, communityMode }: PostProps) {
  const hasBeenRead: boolean =
    useAppSelector((state) => state.post.postReadById[post.post.id]) ||
    post.read;
  const markdownLoneImage = useMemo(
    () => (post.post.body ? findLoneImage(post.post.body) : undefined),
    [post]
  );
  const blurNsfw = useAppSelector(
    (state) => state.settings.appearance.posts.blurNsfw
  );

  function renderPostBody() {
    if (post.post.url) {
      if (isUrlImage(post.post.url)) {
        return (
          <ImageContainer>
            <Image
              blur={isNsfwBlurred(post, blurNsfw)}
              post={post}
              animationType="zoom"
            />
          </ImageContainer>
        );
      }
      if (isUrlVideo(post.post.url)) {
        return (
          <ImageContainer>
            <Video src={post.post.url} blur={isNsfwBlurred(post, blurNsfw)} />
          </ImageContainer>
        );
      }
    }

    if (markdownLoneImage)
      return (
        <ImageContainer>
          <Image
            blur={isNsfwBlurred(post, blurNsfw)}
            post={post}
            animationType="zoom"
          />
        </ImageContainer>
      );

    /**
     * Embedded video, image with a thumbanil
     */
    if (post.post.thumbnail_url && post.post.url) {
      return <Embed post={post} />;
    }

    /**
     * text image with captions
     */
    if (post.post.body) {
      return (
        <>
          {post.post.url && <Embed post={post} />}

          <PostBody isRead={hasBeenRead}>
            <InlineMarkdown>{post.post.body}</InlineMarkdown>
          </PostBody>
        </>
      );
    }

    if (post.post.url) {
      return <Embed post={post} />;
    }
  }

  return (
    <Container>
      <Title isRead={hasBeenRead}>
        <InlineMarkdown>{post.post.name}</InlineMarkdown>{" "}
        {isNsfw(post) && <Nsfw />}
      </Title>

      {renderPostBody()}

      <Details>
        <LeftDetails isRead={hasBeenRead}>
          <CommunityName>
            {post.counts.featured_community || post.counts.featured_local ? (
              <AnnouncementIcon icon={megaphone} />
            ) : undefined}
            {communityMode ? (
              <PersonLink
                person={post.creator}
                showInstanceWhenRemote
                prefix="by"
              />
            ) : (
              <CommunityLink
                community={post.community}
                showInstanceWhenRemote
                subscribed={post.subscribed}
              />
            )}
          </CommunityName>

          <PreviewStats post={post} />
        </LeftDetails>
        <RightDetails>
          <MoreActions post={post} onFeed />
          <VoteButton type="up" postId={post.post.id} />
          <VoteButton type="down" postId={post.post.id} />
        </RightDetails>
      </Details>

      <Save type="post" id={post.post.id} />
    </Container>
  );
}
