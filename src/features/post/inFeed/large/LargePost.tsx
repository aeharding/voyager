import { megaphone } from "ionicons/icons";
import PreviewStats from "../PreviewStats";
import { maxWidthCss } from "../../../shared/AppContent";
import Nsfw, { isNsfw } from "../../../labels/Nsfw";
import { VoteButton } from "../../shared/VoteButton";
import MoreActions from "../../shared/MoreActions";
import PersonLink from "../../../labels/links/PersonLink";
import InlineMarkdown from "../../../shared/markdown/InlineMarkdown";
import { AnnouncementIcon } from "../../../../routes/pages/posts/PostPage";
import CommunityLink from "../../../labels/links/CommunityLink";
import { PostProps } from "../Post";
import Save from "../../../labels/Save";
import { useAppSelector } from "../../../../store";
import ModeratableItem, {
  ModeratableItemBannerOutlet,
} from "../../../moderation/ModeratableItem";
import MoreModActions from "../../shared/MoreModAction";
import ModqueueItemActions from "../../../moderation/ModqueueItemActions";
import Crosspost from "../../crosspost/Crosspost";
import LargePostContents from "./LargePostContents";
import useCrosspostUrl from "../../shared/useCrosspostUrl";
import { useInModqueue } from "../../../../routes/pages/shared/ModqueuePage";
import { useContext } from "react";
import { PageTypeContext } from "../../../feed/PageTypeContext";
import { styled } from "@linaria/react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  padding: 12px;

  position: relative;

  ${maxWidthCss}
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.div<{ isRead: boolean }>`
  color: ${({ isRead }) => (isRead ? "var(--read-color)" : "inherit")};
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

  color: ${({ isRead }) => (isRead ? "var(--read-color-medium)" : "inherit")};
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

  // when show community at top and not showing author, avoid gap
  &:empty {
    display: none;
  }
`;

export default function LargePost({ post }: PostProps) {
  const showVotingButtons = useAppSelector(
    (state) => state.settings.appearance.large.showVotingButtons,
  );
  const alwaysShowAuthor = useAppSelector(
    (state) => state.settings.appearance.posts.alwaysShowAuthor,
  );
  const showCommunityAtTop = useAppSelector(
    (state) => state.settings.appearance.posts.communityAtTop,
  );
  const hasBeenRead =
    useAppSelector((state) => state.post.postReadById[post.post.id]) ||
    post.read;

  const crosspostUrl = useCrosspostUrl(post);

  const inModqueue = useInModqueue();

  const inCommunityFeed = useContext(PageTypeContext) === "community";

  function renderPostBody() {
    if (crosspostUrl) {
      return <Crosspost post={post} url={crosspostUrl} />;
    }

    return <LargePostContents post={post} />;
  }

  return (
    <ModeratableItem itemView={post}>
      <Container>
        <ModeratableItemBannerOutlet />

        <Header>
          {showCommunityAtTop && !inCommunityFeed && (
            <Details>
              <LeftDetails isRead={hasBeenRead}>
                <CommunityLink
                  community={post.community}
                  subscribed={post.subscribed}
                  showInstanceWhenRemote
                  tinyIcon
                />
              </LeftDetails>
            </Details>
          )}

          <Title isRead={hasBeenRead}>
            <InlineMarkdown>{post.post.name}</InlineMarkdown>{" "}
            {isNsfw(post) && <Nsfw />}
          </Title>
        </Header>

        {renderPostBody()}

        <Details>
          <LeftDetails isRead={hasBeenRead}>
            <CommunityName>
              {post.post.featured_community || post.post.featured_local ? (
                <AnnouncementIcon icon={megaphone} />
              ) : undefined}
              {inCommunityFeed ? (
                <PersonLink
                  person={post.creator}
                  showInstanceWhenRemote
                  prefix="by"
                  disableInstanceClick
                />
              ) : (
                <>
                  {!showCommunityAtTop && (
                    <CommunityLink
                      community={post.community}
                      subscribed={post.subscribed}
                      disableInstanceClick
                      showInstanceWhenRemote={
                        !showVotingButtons || !alwaysShowAuthor
                      }
                    />
                  )}
                  {alwaysShowAuthor && (
                    <>
                      {" "}
                      <PersonLink
                        person={post.creator}
                        prefix="by"
                        disableInstanceClick
                      />
                    </>
                  )}
                </>
              )}
            </CommunityName>

            <PreviewStats post={post} />
          </LeftDetails>
          {(showVotingButtons || inModqueue) && (
            <RightDetails>
              {inModqueue && <ModqueueItemActions item={post} />}
              <MoreActions post={post} />
              {!inModqueue && (
                <>
                  <MoreModActions post={post} />
                  <VoteButton type="up" post={post} />
                  <VoteButton type="down" post={post} />
                </>
              )}
            </RightDetails>
          )}
        </Details>

        <Save type="post" id={post.post.id} />
      </Container>
    </ModeratableItem>
  );
}
