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
import { useMemo } from "react";

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
      color: var(--read-color);
    `}
`;

const Aside = styled.div<{ isRead: boolean }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5em;

  color: var(--ion-color-text-aside);
  font-size: 0.8em;

  ${({ isRead }) =>
    isRead &&
    css`
      color: var(--read-color);
    `}
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

  color: var(--ion-color-text-aside);
`;

const EndDetails = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.2rem;

  color: var(--ion-color-text-aside);

  margin-left: auto;
`;

export default function CompactPost({ post, communityMode }: PostProps) {
  const hasBeenRead: boolean =
    useAppSelector((state) => state.post.postReadById[post.post.id]) ||
    post.read;
  const nsfw = useMemo(() => isNsfw(post), [post]);

  return (
    <Container>
      <Thumbnail post={post} />
      <Content>
        <Title isRead={hasBeenRead}>
          {post.post.name} {nsfw && <Nsfw />}
        </Title>
        <Aside isRead={hasBeenRead}>
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
