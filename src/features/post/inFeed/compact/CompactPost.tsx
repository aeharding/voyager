import styled from "@emotion/styled";
import { PostProps } from "../Post";
import Thumbnail from "./Thumbnail";
import { maxWidthCss } from "../../../shared/AppContent";
import PreviewStats from "../PreviewStats";
import MoreActions from "../../shared/MoreActions";
import PersonLink from "../../../labels/links/PersonLink";
import CommunityLink from "../../../labels/links/CommunityLink";
import { VoteButton } from "../../shared/VoteButton";

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px;
  gap: 12px;
  line-height: 1.15;

  ${maxWidthCss}
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
`;

const Aside = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5em;

  color: var(--ion-color-medium);
  font-size: 0.8em;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5em;

  white-space: nowrap;
`;

const StyledMoreActions = styled(MoreActions)`
  font-size: 1.3rem;

  margin: -0.5rem;
  padding: 0.5rem;
`;

const EndDetails = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.2rem;

  color: var(--ion-color-medium);

  margin-left: auto;
`;

export default function CompactPost({ post, communityMode }: PostProps) {
  return (
    <Container>
      <Thumbnail post={post} />
      <Content>
        {post.post.name}
        <Aside>
          {communityMode ? (
            <PersonLink
              person={post.creator}
              showInstanceWhenRemote
              prefix="by"
            />
          ) : (
            <CommunityLink community={post.community} />
          )}
          <Actions>
            <PreviewStats
              stats={post.counts}
              published={post.post.published}
              voteFromServer={post.my_vote}
            />
            <StyledMoreActions post={post} />
          </Actions>
        </Aside>
      </Content>
      <EndDetails>
        <VoteButton type="up" postId={post.post.id} />
        <VoteButton type="down" postId={post.post.id} />
      </EndDetails>
    </Container>
  );
}
