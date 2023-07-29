import {
  CommentReplyView,
  PersonMentionView,
  PrivateMessageView,
} from "lemmy-js-client";
import CommentMarkdown from "../comment/CommentMarkdown";
import { IonIcon, IonItem, useIonToast } from "@ionic/react";
import styled from "@emotion/styled";
import {
  albums,
  chatbubble,
  ellipsisHorizontal,
  mail,
  personCircle,
} from "ionicons/icons";
import Ago from "../labels/Ago";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { getHandle } from "../../helpers/lemmy";
import { useAppDispatch, useAppSelector } from "../../store";
import { getInboxItemId, markRead as markReadAction } from "./inboxSlice";
import { css } from "@emotion/react";
import { isPostReply } from "../../pages/inbox/RepliesPage";
import { maxWidthCss } from "../shared/AppContent";
import VoteArrow from "./VoteArrow";
import SlidingInbox from "../shared/sliding/SlidingInbox";

const Hr = styled.div`
  ${maxWidthCss}

  position: relative;
  height: 1px;

  &::after {
    content: "";
    position: absolute;

    --right-offset: 1.8rem;

    width: calc(100% - var(--right-offset));
    left: var(--right-offset);
    top: 0;
    border-bottom: 1px solid
      var(
        --ion-item-border-color,
        var(--ion-border-color, var(--ion-color-step-250, #c8c7cc))
      );
  }
`;

const StyledIonItem = styled(IonItem)<{ read: boolean }>`
  --ion-item-border-color: transparent;

  ${({ read }) =>
    !read &&
    css`
      --background: var(--unread-item-background-color);
    `}
`;

const Container = styled.div`
  display: flex;
  gap: 1rem;

  ${maxWidthCss}

  padding: 0.5rem 0;

  font-size: 0.875em;

  strong {
    font-weight: 500;
  }
`;

const StartContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Content = styled.div`
  flex: 1;
`;

const Header = styled.div``;

const Body = styled.div`
  color: var(--ion-color-medium);
`;

const Footer = styled.div`
  display: flex;
  align-items: center;

  color: var(--ion-color-medium);

  aside {
    margin-left: auto;

    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const EllipsisIcon = styled(IonIcon)`
  font-size: 1.2rem;
`;

export type InboxItemView =
  | PersonMentionView
  | CommentReplyView
  | PrivateMessageView;

interface InboxItemProps {
  item: InboxItemView;
}

export default function InboxItem({ item }: InboxItemProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const readByInboxItemId = useAppSelector(
    (state) => state.inbox.readByInboxItemId
  );
  const [present] = useIonToast();
  const commentVotesById = useAppSelector(
    (state) => state.comment.commentVotesById
  );

  const vote =
    "comment" in item
      ? commentVotesById[item.comment.id] ??
        (item.my_vote as 1 | 0 | -1 | undefined)
      : undefined;

  function renderHeader() {
    if ("person_mention" in item) {
      return (
        <>
          <strong>{item.creator.name}</strong> mentioned you on the post{" "}
          <strong>{item.post.name}</strong>
        </>
      );
    }
    if ("comment_reply" in item) {
      if (isPostReply(item)) {
        return (
          <>
            <strong>{item.creator.name}</strong> replied to your post{" "}
            <strong>{item.post.name}</strong>
          </>
        );
      } else {
        return (
          <>
            <strong>{item.creator.name}</strong> replied to your comment in{" "}
            <strong>{item.post.name}</strong>
          </>
        );
      }
    }
    if ("private_message" in item) {
      return (
        <>
          <strong>{getHandle(item.creator)}</strong> sent you a private message
        </>
      );
    }
  }

  function renderContents() {
    if ("comment" in item) {
      return item.comment.content;
    }

    return item.private_message.content;
  }

  function renderFooterDetails() {
    if ("comment" in item) {
      return (
        <>
          <strong>{item.creator.name}</strong> in{" "}
          <strong>{item.community.name}</strong>
        </>
      );
    }
  }

  function getLink() {
    if ("comment" in item) {
      return buildGeneralBrowseLink(
        `/c/${getHandle(item.community)}/comments/${item.post.id}/${
          item.comment.path
        }`
      );
    }

    return `/inbox/messages/${getHandle(item.creator)}`;
  }

  function getDate() {
    if ("comment" in item) return item.counts.published;

    return item.private_message.published;
  }

  function getIcon() {
    if ("person_mention" in item) return personCircle;
    if ("comment_reply" in item) {
      if (isPostReply(item)) return albums;
      return chatbubble;
    }
    if ("private_message" in item) return mail;
  }

  async function markRead() {
    try {
      await dispatch(markReadAction(item, true));
    } catch (error) {
      present({
        message: "Failed to mark item as read",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    }
  }

  const contents = (
    <StyledIonItem
      routerLink={getLink()}
      href={undefined}
      detail={false}
      onClick={markRead}
      read={!!readByInboxItemId[getInboxItemId(item)]}
    >
      <Container>
        <StartContent>
          <IonIcon icon={getIcon()} color="medium" />
          <VoteArrow vote={vote} />
        </StartContent>
        <Content>
          <Header>{renderHeader()}</Header>
          <Body>
            <CommentMarkdown>{renderContents()}</CommentMarkdown>
          </Body>
          <Footer>
            <div>{renderFooterDetails()}</div>
            <aside>
              <EllipsisIcon icon={ellipsisHorizontal} />{" "}
              <Ago date={getDate()} />
            </aside>
          </Footer>
        </Content>
      </Container>
    </StyledIonItem>
  );

  if ("comment" in item)
    return (
      <>
        <SlidingInbox item={item}>{contents}</SlidingInbox>
        <Hr />
      </>
    );

  return (
    <>
      {contents}
      <Hr />
    </>
  );
}
