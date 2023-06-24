import {
  CommentReplyView,
  PersonMentionView,
  PrivateMessageView,
} from "lemmy-js-client";
import CommentMarkdown from "../comment/CommentMarkdown";
import { IonIcon, IonItem, useIonToast } from "@ionic/react";
import styled from "@emotion/styled";
import { ellipsisHorizontal } from "ionicons/icons";
import Ago from "../labels/Ago";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { getHandle } from "../../helpers/lemmy";
import useClient from "../../helpers/useClient";
import { useAppDispatch, useAppSelector } from "../../store";
import { getInboxCounts, getInboxItemId, setReadStatus } from "./inboxSlice";
import { css } from "@emotion/react";
import { isPostReply } from "../../pages/inbox/RepliesPage";

const StyledIonItem = styled(IonItem)<{ read: boolean }>`
  ${({ read }) =>
    !read &&
    css`
      --background: rgba(255, 238, 0, 0.1);
    `}
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;

  padding: 0.5rem 0;

  font-size: 0.9em;

  strong {
    font-weight: 500;
  }
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
  const client = useClient();
  const jwt = useAppSelector((state) => state.auth.jwt);
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const readByInboxItemId = useAppSelector(
    (state) => state.inbox.readByInboxItemId
  );
  const [present] = useIonToast();

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

  async function markRead() {
    if (!jwt) throw new Error("needs auth");

    const initialRead = !!readByInboxItemId[getInboxItemId(item)];

    dispatch(setReadStatus({ item, read: true }));

    try {
      if ("person_mention" in item) {
        await client.markPersonMentionAsRead({
          read: true,
          person_mention_id: item.person_mention.id,
          auth: jwt,
        });
      } else if ("comment_reply" in item) {
        await client.markCommentReplyAsRead({
          read: true,
          comment_reply_id: item.comment_reply.id,
          auth: jwt,
        });
      } else if ("private_message" in item) {
        await client.markPrivateMessageAsRead({
          read: true,
          private_message_id: item.private_message.id,
          auth: jwt,
        });
      }
    } catch (error) {
      dispatch(setReadStatus({ item, read: initialRead }));
      present({
        message: "Failed to mark item as read",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    }

    dispatch(getInboxCounts());
  }

  return (
    <StyledIonItem
      routerLink={getLink()}
      detail={false}
      onClick={markRead}
      read={!!readByInboxItemId[getInboxItemId(item)]}
    >
      <Content>
        <Header>{renderHeader()}</Header>
        <Body>
          <CommentMarkdown>{renderContents()}</CommentMarkdown>
        </Body>
        <Footer>
          <div>{renderFooterDetails()}</div>
          <aside>
            <EllipsisIcon icon={ellipsisHorizontal} /> <Ago date={getDate()} />
          </aside>
        </Footer>
      </Content>
    </StyledIonItem>
  );
}
