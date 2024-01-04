import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { megaphone } from "ionicons/icons";
import PreviewStats from "../PreviewStats";
import Embed from "../../shared/Embed";
import { useMemo } from "react";
import { findLoneImage } from "../../../../helpers/markdown";
import { maxWidthCss } from "../../../shared/AppContent";
import Nsfw, { isNsfw, isNsfwBlurred } from "../../../labels/Nsfw";
import { VoteButton } from "../../shared/VoteButton";
import MoreActions from "../../shared/MoreActions";
import PersonLink from "../../../labels/links/PersonLink";
import InlineMarkdown from "../../../shared/InlineMarkdown";
import { AnnouncementIcon } from "../../../../pages/posts/PostPage";
import CommunityLink from "../../../labels/links/CommunityLink";
import { PostProps } from "../Post";
import Save from "../../../labels/Save";
import Media from "./media/Media";
import { useAppSelector } from "../../../../store";
import { isUrlMedia } from "../../../../helpers/url";
import ModeratableItem, {
  ModeratableItemBannerOutlet,
} from "../../../moderation/ModeratableItem";
import MoreModActions from "../../shared/MoreModAction";
import ModqueueItemActions from "../../../moderation/ModqueueItemActions";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  padding: 12px;

  position: relative;

  ${maxWidthCss}
`;

const Title = styled.div<{ isRead: boolean, isBold: boolean }>`
  font-weight: ${({ isBold }) => (isBold ? "bold" : "normal")};

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
  margin: 0 -12px;
`;

export default function LargePost({
  post,
  communityMode,
  modqueue,
}: PostProps) {
  const hasBeenRead: boolean =
    useAppSelector((state) => state.post.postReadById[post.post.id]) ||
    post.read;
  const markdownLoneImage = useMemo(
    () => (post.post.body ? findLoneImage(post.post.body) : undefined),
    [post],
  );
  const { blurNsfw, boldTitles } = useAppSelector(
    (state) => state.settings.appearance.posts,
  );

  function renderPostBody() {
    if ((post.post.url && isUrlMedia(post.post.url)) || markdownLoneImage) {
      return (
        <ImageContainer>
          <Media
            blur={isNsfwBlurred(post, blurNsfw)}
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
    <ModeratableItem itemView={post}>
      <Container>
        <ModeratableItemBannerOutlet />

        <Title isRead={hasBeenRead} isBold={boldTitles}>
          <InlineMarkdown>{post.post.name}</InlineMarkdown>{" "}
          {isNsfw(post) && <Nsfw />}
        </Title>

        {renderPostBody()}

        <Details>
          <LeftDetails isRead={hasBeenRead}>
            <CommunityName>
              {post.post.featured_community || post.post.featured_local ? (
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
            {modqueue && <ModqueueItemActions item={post} />}
            <MoreActions post={post} onFeed />
            {!modqueue && (
              <>
                <MoreModActions post={post} onFeed />
                <VoteButton type="up" postId={post.post.id} />
                <VoteButton type="down" postId={post.post.id} />
              </>
            )}
          </RightDetails>
        </Details>

        <Save type="post" id={post.post.id} />
      </Container>
    </ModeratableItem>
  );
}
