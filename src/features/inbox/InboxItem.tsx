import {
  CommentReplyView,
  PersonMentionView,
  PrivateMessageView,
} from "lemmy-js-client";
import CommentMarkdown from "../comment/CommentMarkdown";
import { IonIcon, IonItem } from "@ionic/react";
import { albums, chatbubble, mail, personCircle } from "ionicons/icons";
import Ago from "../labels/Ago";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { getHandle } from "../../helpers/lemmy";
import { useAppDispatch, useAppSelector } from "../../store";
import { getInboxItemId, markRead as markReadAction } from "./inboxSlice";
import { isPostReply } from "../../routes/pages/inbox/RepliesPage";
import { maxWidthCss } from "../shared/AppContent";
import VoteArrow from "./VoteArrow";
import SlidingInbox from "../shared/sliding/SlidingInbox";
import useAppToast from "../../helpers/useAppToast";
import InboxItemMoreActions, {
  InboxItemMoreActionsHandle,
} from "./InboxItemMoreActions";
import { styled } from "@linaria/react";
import { css, cx } from "@linaria/core";
import { isTouchDevice } from "../../helpers/device";
import PersonLink from "../labels/links/PersonLink";
import CommunityLink from "../labels/links/CommunityLink";
import { useCallback, useRef } from "react";
import { useLongPress } from "use-long-press";
import { filterEvents } from "../../helpers/longPress";
import { stopIonicTapClick } from "../../helpers/ionic";

const labelStyles = css`
  display: inline-flex;
  max-width: 100%;

  font-weight: 500;

  a {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Hr = styled.div`
  ${maxWidthCss}

  position: relative;
  height: 1px;

  &::after {
    content: "";
    position: absolute;

    --right-offset: calc(23px + 1lh);

    width: calc(100% - var(--right-offset));
    left: var(--right-offset);
    top: 0;
    border-bottom: 1px solid
      var(
        --ion-item-border-color,
        var(--ion-border-color, var(--ion-background-color-step-250, #c8c7cc))
      );
  }
`;

const StyledIonItem = styled(IonItem)`
  --ion-item-border-color: transparent;
  --padding-start: 12px;
`;

const itemUnreadCss = css`
  --background: var(--unread-item-background-color);
`;

const Container = styled.div`
  display: flex;
  gap: var(--padding-start);

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
  gap: var(--padding-start);

  ion-icon {
    width: 1lh;
    height: 1lh;
  }
`;

const TypeIcon = styled(IonIcon)`
  color: var(--ion-color-medium2);
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Header = styled.div``;

const Body = styled.div`
  color: var(--ion-color-medium);
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  color: var(--ion-color-medium);

  > div {
    min-width: 0;
  }

  > aside {
    margin-left: auto;

    display: flex;
    align-items: center;
    gap: 6px;

    color: var(--ion-color-medium2);
  }
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
    (state) => state.inbox.readByInboxItemId,
  );
  const presentToast = useAppToast();
  const commentVotesById = useAppSelector(
    (state) => state.comment.commentVotesById,
  );

  const vote =
    "comment" in item
      ? (commentVotesById[item.comment.id] ??
        (item.my_vote as 1 | 0 | -1 | undefined))
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
          <PersonLink
            person={item.creator}
            className={labelStyles}
            showBadge={false}
          />{" "}
          in{" "}
          <CommunityLink
            community={item.community}
            subscribed={item.subscribed}
            hideIcon
            className={labelStyles}
          />
        </>
      );
    }
  }

  function getLink() {
    if ("comment" in item) {
      return buildGeneralBrowseLink(
        `/c/${getHandle(item.community)}/comments/${item.post.id}/${
          item.comment.path
        }`,
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
      presentToast({
        message: "Failed to mark item as read",
        color: "danger",
      });

      throw error;
    }
  }

  const read = !!readByInboxItemId[getInboxItemId(item)];

  const ellipsisHandleRef = useRef<InboxItemMoreActionsHandle>(null);

  const onCommentLongPress = useCallback(() => {
    ellipsisHandleRef.current?.present();
    stopIonicTapClick();
  }, []);

  const bind = useLongPress(onCommentLongPress, {
    threshold: 800,
    cancelOnMovement: 15,
    filterEvents,
  });

  const contents = (
    <StyledIonItem
      mode="ios" // Use iOS style activatable tap highlight
      className={cx(
        !read && itemUnreadCss,
        isTouchDevice() && "ion-activatable",
      )}
      routerLink={getLink()}
      href={undefined}
      detail={false}
      onClick={markRead}
      {...bind()}
    >
      <Container>
        <StartContent>
          <TypeIcon icon={getIcon()} />
          <VoteArrow vote={vote} />
        </StartContent>
        <Content>
          <Header>{renderHeader()}</Header>
          <Body>
            <CommentMarkdown id={getItemId(item)}>
              {renderContents()}
            </CommentMarkdown>
          </Body>
          <Footer>
            <div>{renderFooterDetails()}</div>
            <aside>
              <InboxItemMoreActions item={item} ref={ellipsisHandleRef} />
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

function getItemId(item: InboxItemView): string {
  switch (true) {
    case "person_mention" in item:
      return `mention-${item.person_mention.id}`;
    case "comment_reply" in item:
      return `comment-reply-${item.comment_reply.id}`;
    case "private_message" in item:
      return `private-message-${item.private_message.id}`;
  }

  // typescript should be smarter (this shouldn't be necessary)
  throw new Error("getItemId: Unexpected item");
}
