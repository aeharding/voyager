import { styled } from "@linaria/react";
import { megaphone } from "ionicons/icons";
import { useContext, useMemo } from "react";

import { PageTypeContext } from "#/features/feed/PageTypeContext";
import Nsfw, { isNsfw } from "#/features/labels/Nsfw";
import Save from "#/features/labels/Save";
import CommunityLink from "#/features/labels/links/CommunityLink";
import PersonLink from "#/features/labels/links/PersonLink";
import ModeratableItem, {
  ModeratableItemBannerOutlet,
} from "#/features/moderation/ModeratableItem";
import ModqueueItemActions from "#/features/moderation/ModqueueItemActions";
import CompactCrosspost from "#/features/post/crosspost/CompactCrosspost";
import { AnnouncementIcon } from "#/features/post/detail/PostHeader";
import MoreActions from "#/features/post/shared/MoreActions";
import MoreModActions from "#/features/post/shared/MoreModAction";
import { VoteButton } from "#/features/post/shared/VoteButton";
import useCrosspostUrl from "#/features/post/shared/useCrosspostUrl";
import { maxWidthCss } from "#/features/shared/AppContent";
import InlineMarkdown from "#/features/shared/markdown/InlineMarkdown";
import { isUrlImage, parseUrlForDisplay } from "#/helpers/url";
import { useInModqueue } from "#/routes/pages/shared/ModqueuePage";
import { useAppSelector } from "#/store";

import { PostProps } from "../Post";
import PreviewStats from "../PreviewStats";
import Thumbnail from "./Thumbnail";

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

  color: ${({ isRead }) => (isRead ? "var(--read-color)" : "inherit")};
`;

const Aside = styled.div<{ isRead: boolean }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  color: var(--ion-color-text-aside);
  font-size: 0.8em;

  color: ${({ isRead }) => (isRead ? "var(--read-color)" : "inherit")};
`;

const From = styled.div`
  white-space: nowrap;

  overflow: hidden;
  text-overflow: ellipsis;

  &:empty {
    display: none;
  }
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

const actionButtonStyles = `
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

const Domain = styled.span`
  white-space: nowrap;

  font-size: 0.9em;
  opacity: 0.8;

  display: inline-flex;
  max-width: 100%;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export default function CompactPost({ post }: PostProps) {
  const alwaysShowAuthor = useAppSelector(
    (state) => state.settings.appearance.posts.alwaysShowAuthor,
  );
  const compactThumbnailPositionType = useAppSelector(
    (state) => state.settings.appearance.compact.thumbnailsPosition,
  );
  const compactShowVotingButtons = useAppSelector(
    (state) => state.settings.appearance.compact.showVotingButtons,
  );
  const showCommunityAtTop = useAppSelector(
    (state) => state.settings.appearance.posts.communityAtTop,
  );

  const crosspostUrl = useCrosspostUrl(post);

  const inModqueue = useInModqueue();

  const inCommunityFeed = useContext(PageTypeContext) === "community";

  const hasBeenRead: boolean =
    useAppSelector((state) => state.post.postReadById[post.post.id]) ||
    post.read;
  const nsfw = useMemo(() => isNsfw(post), [post]);

  const [domain] = useMemo(
    () =>
      post.post.url && !isUrlImage(post.post.url, post.post.url_content_type)
        ? parseUrlForDisplay(post.post.url)
        : [],
    [post],
  );

  return (
    <ModeratableItem itemView={post}>
      <Container>
        <ModeratableItemBannerOutlet />

        <Contents>
          {compactThumbnailPositionType === "left" && <Thumbnail post={post} />}
          <Content>
            {(inModqueue || showCommunityAtTop) && !inCommunityFeed && (
              <Aside isRead={false}>
                <CommunityLink
                  community={post.community}
                  subscribed={post.subscribed}
                  showInstanceWhenRemote
                  tinyIcon
                />
              </Aside>
            )}
            <Title isRead={hasBeenRead}>
              <InlineMarkdown>{post.post.name}</InlineMarkdown>{" "}
              {domain && (
                <>
                  <Domain>
                    (<span>{domain}</span>)
                  </Domain>{" "}
                </>
              )}
              {nsfw && <Nsfw />}
            </Title>
            <Aside isRead={hasBeenRead}>
              <From>
                {post.post.featured_community || post.post.featured_local ? (
                  <AnnouncementIcon icon={megaphone} />
                ) : undefined}
                {inCommunityFeed || inModqueue ? (
                  <PersonLink
                    person={post.creator}
                    showInstanceWhenRemote
                    prefix="by"
                    sourceUrl={post.post.ap_id}
                  />
                ) : (
                  <>
                    {!showCommunityAtTop && (
                      <CommunityLink
                        community={post.community}
                        subscribed={post.subscribed}
                        tinyIcon
                      />
                    )}
                    {alwaysShowAuthor && (
                      <>
                        {" "}
                        <PersonLink
                          person={post.creator}
                          prefix="by"
                          sourceUrl={post.post.ap_id}
                        />
                      </>
                    )}
                  </>
                )}
              </From>
              <ActionsContainer>
                <PreviewStats post={post} />
                {inModqueue ? (
                  <ModqueueItemActions item={post} />
                ) : (
                  <StyledModActions post={post} solidIcon />
                )}
                <StyledMoreActions post={post} />
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
              <VoteButton type="up" post={post} />
              <VoteButton type="down" post={post} />
            </EndDetails>
          )}
          <Save type="post" id={post.post.id} />
        </Contents>
      </Container>
    </ModeratableItem>
  );
}
