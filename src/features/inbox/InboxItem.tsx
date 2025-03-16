import { IonIcon, IonItem } from "@ionic/react";
import { albums, chatbubble, mail, personCircle } from "ionicons/icons";
import {
  CommentReplyView,
  PersonMentionView,
  PrivateMessageView,
} from "lemmy-js-client";
import { useCallback, useRef } from "react";
import { useLongPress } from "use-long-press";

import CommentMarkdown from "#/features/comment/CommentMarkdown";
import Ago from "#/features/labels/Ago";
import CommunityLink from "#/features/labels/links/CommunityLink";
import PersonLink from "#/features/labels/links/PersonLink";
import SlidingInbox from "#/features/shared/sliding/SlidingInbox";
import { cx } from "#/helpers/css";
import { isTouchDevice } from "#/helpers/device";
import { stopIonicTapClick } from "#/helpers/ionic";
import { getHandle } from "#/helpers/lemmy";
import { filterEvents } from "#/helpers/longPress";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useAppToast from "#/helpers/useAppToast";
import { isPostReply } from "#/routes/pages/inbox/RepliesPage";
import { useAppDispatch, useAppSelector } from "#/store";

import InboxItemMoreActions, {
  InboxItemMoreActionsHandle,
} from "./InboxItemMoreActions";
import { getInboxItemId, markRead as markReadAction } from "./inboxSlice";
import VoteArrow from "./VoteArrow";

import styles from "./InboxItem.module.css";

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
            className={styles.label}
            showBadge={false}
            sourceUrl={getSourceUrl()}
          />{" "}
          in{" "}
          <CommunityLink
            community={item.community}
            subscribed={item.subscribed}
            hideIcon
            className={styles.label}
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

  function getSourceUrl() {
    if ("comment" in item) return item.comment.ap_id;
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

  const ellipsisHandleRef = useRef<InboxItemMoreActionsHandle>(undefined);

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
    <IonItem
      mode="ios" // Use iOS style activatable tap highlight
      className={cx(
        styles.item,
        !read && styles.itemUnread,
        isTouchDevice() && "ion-activatable",
      )}
      routerLink={getLink()}
      href={undefined}
      detail={false}
      onClick={markRead}
      {...bind()}
    >
      <div className={styles.container}>
        <div className={styles.startContent}>
          <IonIcon className={styles.typeIcon} icon={getIcon()} />
          <VoteArrow vote={vote} />
        </div>
        <div className={styles.content}>
          <div>{renderHeader()}</div>
          <div className={styles.body}>
            <CommentMarkdown id={getItemId(item)}>
              {renderContents()}
            </CommentMarkdown>
          </div>
          <div className={styles.footer}>
            <div>{renderFooterDetails()}</div>
            <aside>
              <InboxItemMoreActions item={item} ref={ellipsisHandleRef} />
              <Ago date={getDate()} />
            </aside>
          </div>
        </div>
      </div>
    </IonItem>
  );

  return (
    <>
      <SlidingInbox item={item}>{contents}</SlidingInbox>
      <div className={styles.hr} />
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
