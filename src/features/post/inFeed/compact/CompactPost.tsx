import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { PostProps } from "../Post";
import Thumbnail from "./Thumbnail";
import { maxWidthCss } from "../../../shared/AppContent";
import PreviewStats from "../PreviewStats";
import MoreActions from "../../shared/MoreActions";
import { megaphone } from "ionicons/icons";
import PersonLink from "../../../labels/links/PersonLink";
import CommunityLink from "../../../labels/links/CommunityLink";
import { VoteButton } from "../../shared/VoteButton";
import Save from "../../../labels/Save";
import Nsfw, { isNsfw } from "../../../labels/Nsfw";
import { useAppSelector } from "../../../../store";
import { useMemo } from "react";
import InlineMarkdown from "../../../shared/InlineMarkdown";
import MoreModActions from "../../shared/MoreModAction";
import ModeratableItem, {
  ModeratableItemBannerOutlet,
} from "../../../moderation/ModeratableItem";
import ModqueueItemActions from "../../../moderation/ModqueueItemActions";
import { AnnouncementIcon } from "../../detail/PostHeader";
import CompactCrosspost from "./CompactCrosspost";
import useCrosspostUrl from "../../shared/useCrosspostUrl";

const Container = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 12px;
`;

const Contents = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  line-height: 1.15;

  position: relative;

  ${maxWidthCss}
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  min-width: 0;
  flex: 1;
`;

const Title = styled.span<{ isRead: boolean }>`
  font-size: 0.9375em;

  ${({ isRead }) =>
    isRead &&
    css`
      color: var(--read-color);
    `}
`;

const Aside = styled.div<{ isRead: boolean }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  color: var(--ion-color-text-aside);
  font-size: 0.8em;

  ${({ isRead }) =>
    isRead &&
    css`
      color: var(--read-color);
    `}
`;

const From = styled.div`
  white-space: nowrap;

  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  > button {
    font-size: 1.2em;

    padding: 6px 3px;
    margin: -10px -3px;

    &.large {
      font-size: 1.6em;
    }
  }

  white-space: nowrap;
`;

const actionButtonStyles = css`
  margin: -0.5rem;
  padding: 0.5rem;

  color: var(--ion-color-text-aside);
`;

const StyledMoreActions = styled(MoreActions)`
  font-size: 1.3rem;

  ${actionButtonStyles}
`;

const StyledModActions = styled(MoreModActions)`
  font-size: 1.1em;

  ${actionButtonStyles}
`;

const EndDetails = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.2rem;

  color: var(--ion-color-text-aside);

  margin-left: auto;
`;

export default function CompactPost({
  post,
  communityMode,
  modqueue,
}: PostProps) {
  const compactThumbnailPositionType = useAppSelector(
    (state) => state.settings.appearance.compact.thumbnailsPosition,
  );

  const compactShowVotingButtons = useAppSelector(
    (state) => state.settings.appearance.compact.showVotingButtons,
  );

  const crosspostUrl = useCrosspostUrl(post);

  const hasBeenRead: boolean =
    useAppSelector((state) => state.post.postReadById[post.post.id]) ||
    post.read;
  const nsfw = useMemo(() => isNsfw(post), [post]);

  return (
    <ModeratableItem itemView={post}>
      <Container>
        <ModeratableItemBannerOutlet />

        <Contents>
          {compactThumbnailPositionType === "left" && <Thumbnail post={post} />}
          <Content>
            {modqueue && !communityMode && (
              <Aside isRead={false}>
                <CommunityLink
                  community={post.community}
                  subscribed={post.subscribed}
                  showIcon={false}
                />
              </Aside>
            )}
            <Title isRead={hasBeenRead}>
              <InlineMarkdown>{post.post.name}</InlineMarkdown>{" "}
              {nsfw && <Nsfw />}
            </Title>
            <Aside isRead={hasBeenRead}>
              <From>
                {post.post.featured_community || post.post.featured_local ? (
                  <AnnouncementIcon icon={megaphone} />
                ) : undefined}
                {communityMode || modqueue ? (
                  <PersonLink
                    person={post.creator}
                    showInstanceWhenRemote
                    prefix="by"
                  />
                ) : (
                  <CommunityLink
                    community={post.community}
                    subscribed={post.subscribed}
                  />
                )}
              </From>
              <ActionsContainer>
                <PreviewStats post={post} />
                {modqueue ? (
                  <ModqueueItemActions item={post} />
                ) : (
                  <StyledModActions post={post} onFeed solidIcon />
                )}
                <StyledMoreActions post={post} onFeed />
              </ActionsContainer>
            </Aside>
            {crosspostUrl && (
              <div>
                <CompactCrosspost post={post} url={crosspostUrl} />
              </div>
            )}
          </Content>
          {compactThumbnailPositionType === "right" && (
            <Thumbnail post={post} />
          )}
          {compactShowVotingButtons === true && (
            <EndDetails>
              <VoteButton type="up" postId={post.post.id} />
              <VoteButton type="down" postId={post.post.id} />
            </EndDetails>
          )}
          <Save type="post" id={post.post.id} />
        </Contents>
      </Container>
    </ModeratableItem>
  );
}
