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
  }

  function getDate() {
    if ("comment" in item) return item.counts.published;

    return item.private_message.published;
  }

  async function markRead() {
    if (!jwt) throw new Error("needs auth");

    const initialRead = !!readByInboxItemId[getInboxItemId(item)];

    dispatch(setReadStatus({ item, read: true }));

    if ("person_mention" in item) {
      try {
        await client.markPersonMentionAsRead({
          read: true,
          person_mention_id: item.person_mention.id,
          auth: jwt,
        });
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
          <CommentMarkdown>{`${renderContents()} wefjweof jiweoifj weofi  wejfowef j\n\nwefowejfiwoefj`}</CommentMarkdown>
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
