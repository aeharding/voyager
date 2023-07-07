import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { PostProps } from "../Post";
import Thumbnail from "./Thumbnail";
import { maxWidthCss } from "../../../shared/AppContent";
import PreviewStats from "../PreviewStats";
import MoreActions from "../../shared/MoreActions";
import PersonLink from "../../../labels/links/PersonLink";
import CommunityLink from "../../../labels/links/CommunityLink";
import { VoteButton } from "../../shared/VoteButton";
import Save from "../../../labels/Save";
import Nsfw, { isNsfw } from "../../../labels/Nsfw";
import { useAppSelector } from "../../../../store";

const readOpacity = 0.6;

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px;
  gap: 12px;
  line-height: 1.15;

  position: relative;

  ${maxWidthCss}
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
`;

const Title = styled.span<{ isRead: boolean }>`
  ${({ isRead }) =>
    isRead &&
    css`
      opacity: ${readOpacity};
    `}
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
  const hasBeenRead: boolean =
    useAppSelector((state) => state.post.postReadById[post.post.id]) ||
    post.read;

  return (
    <Container>
      <Thumbnail post={post} />
      <Content>
        <Title isRead={hasBeenRead}>
          {post.post.name} {isNsfw(post) && <Nsfw />}
        </Title>
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
            <PreviewStats post={post} />
            <StyledMoreActions post={post} onFeed />
          </Actions>
        </Aside>
      </Content>
      <EndDetails>
        <VoteButton type="up" postId={post.post.id} />
        <VoteButton type="down" postId={post.post.id} />
      </EndDetails>

      <Save type="post" id={post.post.id} />
    </Container>
  );
}
