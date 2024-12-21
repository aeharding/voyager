import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLoading,
  useIonAlert,
} from "@ionic/react";
import { chevronForwardOutline } from "ionicons/icons";
import { PrivateMessageView } from "lemmy-js-client";
import { useState } from "react";

import { clientSelector } from "#/features/auth/authSelectors";
import ItemIcon from "#/features/labels/img/ItemIcon";
import { blockUser } from "#/features/user/userSlice";
import { getHandle } from "#/helpers/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

import Time from "./Time";

import styles from "./ConversationItem.module.css";

interface ConversationItemProps {
  messages: PrivateMessageView[];
}

export default function ConversationItem({ messages }: ConversationItemProps) {
  const dispatch = useAppDispatch();
  const [present] = useIonAlert();
  const [loading, setLoading] = useState(false);
  const myUserId = useAppSelector(
    (state) =>
      state.site.response?.my_user?.local_user_view?.local_user?.person_id,
  );
  const client = useAppSelector(clientSelector);

  const previewMsg = messages[0]!; // presorted, newest => oldest

  const person =
    previewMsg.creator.id === myUserId
      ? previewMsg.recipient
      : previewMsg.creator;

  const unread = !!messages.find(
    (msg) =>
      !msg.private_message.read && msg.private_message.creator_id !== myUserId,
  );

  async function onDelete() {
    const theirs = messages.filter((m) => m.creator.id !== myUserId);

    const theirPotentialRecentMessage = theirs.pop();

    if (!theirPotentialRecentMessage) {
      present(
        "This user hasn't messaged you, so there's nothing to block/report.",
      );
      return;
    }

    await present("Block and report conversation?", [
      {
        text: "Just block",
        role: "destructive",
        handler: () => {
          blockAndReportIfNeeded(theirPotentialRecentMessage);
        },
      },
      {
        text: "Block + Report",
        role: "destructive",
        handler: () => {
          blockAndReportIfNeeded(theirPotentialRecentMessage, true);
        },
      },
    ]);
  }

  async function blockAndReportIfNeeded(
    theirRecentMessage: PrivateMessageView,
    report = false,
  ) {
    setLoading(true);

    try {
      if (report) {
        await client.createPrivateMessageReport({
          private_message_id: theirRecentMessage.private_message.id,
          reason: "Spam or abuse",
        });
      }

      dispatch(blockUser(true, theirRecentMessage.creator.id));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <IonLoading isOpen={loading} />
      <IonItemSliding>
        <IonItemOptions side="end" onIonSwipe={onDelete}>
          <IonItemOption color="danger" expandable onClick={onDelete}>
            Block
          </IonItemOption>
        </IonItemOptions>

        <IonItem
          routerLink={`/inbox/messages/${getHandle(person)}`}
          href={undefined}
          draggable={false}
          detail={false}
        >
          <div slot="start">
            {unread ? <div className={styles.dot} /> : ""}
            <ItemIcon item={person} size={44} className={styles.itemIcon} />
          </div>
          <div className={styles.messageContent}>
            <div className={styles.messageLine}>
              <h3 className={styles.personLabel}>
                {person.display_name ?? getHandle(person)}
              </h3>
              <span className={styles.openDetails}>
                <span>
                  <Time date={previewMsg.private_message.published} />
                </span>
                <IonIcon icon={chevronForwardOutline} />
              </span>
            </div>
            <div className={styles.messagePreview}>
              {previewMsg.private_message.content}
            </div>
          </div>
        </IonItem>
      </IonItemSliding>
    </>
  );
}
