import { IonIcon, IonItem } from "@ionic/react";
import { useCallback, useRef } from "react";
import { NotificationView } from "threadiverse";
import { useLongPress } from "use-long-press";

import Ago from "#/features/labels/Ago";
import SlidingInbox from "#/features/shared/sliding/SlidingInbox";
import { cx } from "#/helpers/css";
import { isTouchDevice } from "#/helpers/device";
import { stopIonicTapClick } from "#/helpers/ionic";
import { filterEvents } from "#/helpers/longPress";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useAppToast from "#/helpers/useAppToast";
import { useOpenInSecondColumnIfNeededProps } from "#/routes/twoColumn/useOpenInSecondColumnIfNeededProps";
import { useAppDispatch, useAppSelector } from "#/store";

import {
  getInboxItemBody,
  getInboxItemFooterDetails,
  getInboxItemHeader,
  getInboxItemIcon,
  getInboxItemLink,
} from "./inboxItemContents";
import InboxItemMoreActions, {
  InboxItemMoreActionsHandle,
} from "./InboxItemMoreActions";
import { getNotificationKey, markNotificationRead } from "./inboxSlice";
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

  const itemLinkProps = useOpenInSecondColumnIfNeededProps(
    getInboxItemLink(item, buildGeneralBrowseLink),
  );
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
          <IonIcon className={styles.typeIcon} icon={getInboxItemIcon(item)} />
          <VoteArrow vote={vote} />
        </div>
        <div className={styles.content}>
          <div>{getInboxItemHeader(item)}</div>
          <div className={styles.body}>{getInboxItemBody(item)}</div>
          <div className={styles.footer}>
            <div>{getInboxItemFooterDetails(item)}</div>
            <aside>
              <InboxItemMoreActions item={item} ref={ellipsisHandleRef} />
              <Ago date={item.notification.published_at} />
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
