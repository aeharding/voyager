import { IonIcon, IonItem } from "@ionic/react";
import { albums, chatbubble, hammer, mail, personCircle } from "ionicons/icons";
import { useCallback, useMemo, useRef } from "react";
import { NotificationView } from "threadiverse";
import { useLongPress } from "use-long-press";

import CommentMarkdown from "#/features/comment/CommentMarkdown";
import Ago from "#/features/labels/Ago";
import CommunityLink from "#/features/labels/links/CommunityLink";
import PersonLink from "#/features/labels/links/PersonLink";
import { renderModlogData } from "#/features/moderation/logs/ModlogItem";
import PostTitleMarkdown from "#/features/shared/markdown/PostTitleMarkdown";
import SlidingInbox from "#/features/shared/sliding/SlidingInbox";
import { cx } from "#/helpers/css";
import { isTouchDevice } from "#/helpers/device";
import { stopIonicTapClick } from "#/helpers/ionic";
import { getHandle } from "#/helpers/lemmy";
import { filterEvents } from "#/helpers/longPress";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useAppToast from "#/helpers/useAppToast";
import { isPostReply } from "#/routes/pages/inbox/RepliesPage";
import { useOpenInSecondColumnIfNeededProps } from "#/routes/twoColumn/useOpenInSecondColumnIfNeededProps";
import { useAppDispatch, useAppSelector } from "#/store";

import InboxItemMoreActions, {
  InboxItemMoreActionsHandle,
} from "./InboxItemMoreActions";
import { getNotificationKey, markNotificationRead } from "./inboxSlice";
import { inboxModActionTitle } from "./modActionTitle";
import VoteArrow from "./VoteArrow";

import styles from "./InboxItem.module.css";

export type InboxItemView = NotificationView;

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
  const storeVote = useAppSelector((state) =>
    item.data.type_ === "comment"
      ? state.comment.commentVotesById[item.data.comment.id]
      : undefined,
  );

  const vote =
    item.data.type_ === "comment"
      ? (storeVote ?? (item.data.my_vote as 1 | 0 | -1 | undefined))
      : undefined;

  // Modlog notifications (e.g. "your post was removed") aren't a
  // comment/post/PM, so we render them through the same per-kind helpers
  // the modlog page uses.
  const modAction = useMemo(
    () =>
      item.data.type_ === "mod_action"
        ? renderModlogData(item.data)
        : undefined,
    [item.data],
  );

  function renderHeader() {
    if (item.data.type_ === "mod_action") {
      return <strong>{inboxModActionTitle(item.data)}</strong>;
    }
    if (item.notification.kind === "mention" && item.data.type_ === "comment") {
      return (
        <>
          <strong>{item.data.creator.name}</strong> mentioned you on the post{" "}
          <strong>
            <PostTitleMarkdown>{item.data.post.name}</PostTitleMarkdown>
          </strong>
        </>
      );
    }
    if (item.notification.kind === "reply" && item.data.type_ === "comment") {
      if (isPostReply(item)) {
        return (
          <>
            <strong>{item.data.creator.name}</strong> replied to your post{" "}
            <strong>
              <PostTitleMarkdown>{item.data.post.name}</PostTitleMarkdown>
            </strong>
          </>
        );
      } else {
        return (
          <>
            <strong>{item.data.creator.name}</strong> replied to your comment in{" "}
            <strong>
              <PostTitleMarkdown>{item.data.post.name}</PostTitleMarkdown>
            </strong>
          </>
        );
      }
    }
    // New comment on a post in a community you've subscribed to notifications
    // for (Lemmy v1 "subscribed" notifications).
    if (
      item.notification.kind === "subscribed" &&
      item.data.type_ === "comment"
    ) {
      return (
        <>
          <strong>{item.data.creator.name}</strong> commented on{" "}
          <strong>
            <PostTitleMarkdown>{item.data.post.name}</PostTitleMarkdown>
          </strong>
        </>
      );
    }
    // A new post: either in a subscribed community, or one that mentions you.
    if (item.data.type_ === "post") {
      const postTitle = (
        <strong>
          <PostTitleMarkdown>{item.data.post.name}</PostTitleMarkdown>
        </strong>
      );
      if (item.notification.kind === "mention") {
        return (
          <>
            <strong>{item.data.creator.name}</strong> mentioned you on the post{" "}
            {postTitle}
          </>
        );
      }
      return (
        <>
          <strong>{item.data.creator.name}</strong> posted {postTitle}
        </>
      );
    }
    if (item.data.type_ === "private_message") {
      return (
        <>
          <strong>{getHandle(item.data.creator)}</strong> sent you a private
          message
        </>
      );
    }
  }

  function renderBody() {
    if (item.data.type_ === "comment") {
      return (
        <CommentMarkdown id={getItemId(item)}>
          {item.data.comment.content}
        </CommentMarkdown>
      );
    }
    if (item.data.type_ === "post") {
      return (
        <CommentMarkdown id={getItemId(item)}>
          {item.data.post.body ?? ""}
        </CommentMarkdown>
      );
    }
    if (item.data.type_ === "private_message") {
      return (
        <CommentMarkdown id={getItemId(item)}>
          {item.data.private_message.content}
        </CommentMarkdown>
      );
    }
    if (modAction) {
      return (
        <>
          <p>{modAction.reason ?? "No reason provided"}</p>
        </>
      );
    }
  }

  function renderFooterDetails() {
    if (item.data.type_ === "comment" || item.data.type_ === "post") {
      return (
        <>
          <PersonLink
            person={item.data.creator}
            className={styles.label}
            showBadge={false}
            sourceUrl={getSourceUrl()}
          />{" "}
          in{" "}
          <CommunityLink
            community={item.data.community}
            subscribed={item.data.subscribed}
            hideIcon
            className={styles.label}
          />
        </>
      );
    }
    if (modAction && item.data.type_ === "mod_action") {
      const community = item.data.target_community;
      return community ? (
        <CommunityLink
          community={community}
          subscribed="NotSubscribed"
          hideIcon
          className={styles.label}
        />
      ) : undefined;
    }
  }

  function getLink() {
    if (item.data.type_ === "comment") {
      return buildGeneralBrowseLink(
        `/c/${getHandle(item.data.community)}/comments/${item.data.post.id}/${
          item.data.comment.path
        }`,
      );
    }
    if (item.data.type_ === "post") {
      return buildGeneralBrowseLink(
        `/c/${getHandle(item.data.community)}/comments/${item.data.post.id}`,
      );
    }
    if (item.data.type_ === "private_message") {
      return `/inbox/messages/${getHandle(item.data.creator)}`;
    }
    if (modAction?.link) return buildGeneralBrowseLink(modAction.link);
    return "";
  }

  function getDate() {
    return item.notification.published_at;
  }

  function getSourceUrl() {
    if (item.data.type_ === "comment") return item.data.comment.ap_id;
    if (item.data.type_ === "post") return item.data.post.ap_id;
  }

  function getIcon() {
    if (item.notification.kind === "mention") return personCircle;
    if (item.notification.kind === "reply") {
      if (isPostReply(item)) return albums;
      return chatbubble;
    }
    if (item.notification.kind === "private_message") return mail;
    if (item.notification.kind === "subscribed") {
      return item.data.type_ === "post" ? albums : chatbubble;
    }
    // All mod_action kinds share the hammer — title carries the specifics.
    if (item.notification.kind === "mod_action") return hammer;
  }

  async function markRead() {
    try {
      await dispatch(
        markNotificationRead(
          {
            kind: item.notification.kind,
            notificationId: item.notification.id,
          },
          true,
        ),
      );
    } catch (error) {
      presentToast({
        message: "Failed to mark item as read",
        color: "danger",
      });

      throw error;
    }
  }

  const read = !!readByInboxItemId[getNotificationKey(item.notification)];

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

  const itemLinkProps = useOpenInSecondColumnIfNeededProps(getLink());
  const contents = (
    <IonItem
      mode="ios" // Use iOS style activatable tap highlight
      {...itemLinkProps}
      className={cx(
        styles.item,
        !read && styles.itemUnread,
        isTouchDevice() && "ion-activatable",
        itemLinkProps.className,
      )}
      onClick={(e) => {
        itemLinkProps.onClick(e);
        markRead();
      }}
      href={undefined}
      detail={false}
      {...bind()}
    >
      <div className={styles.container}>
        <div className={styles.startContent}>
          <IonIcon className={styles.typeIcon} icon={getIcon()} />
          <VoteArrow vote={vote} />
        </div>
        <div className={styles.content}>
          <div>{renderHeader()}</div>
          <div className={styles.body}>{renderBody()}</div>
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
  return `${item.notification.kind}-${item.notification.id}`;
}
