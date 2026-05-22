import { useIonViewDidLeave, useIonViewWillEnter } from "@ionic/react";
import {
  use,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { useLongPress } from "use-long-press";

import { SharedDialogContext } from "#/features/auth/SharedDialogContext";
import Markdown from "#/features/shared/markdown/Markdown";
import { cx } from "#/helpers/css";
import { useAppDispatch, useAppSelector } from "#/store";

import {
  markNotificationRead,
  PrivateMessageNotification,
} from "../inboxSlice";

import styles from "./Message.module.css";

interface MessageProps {
  message: PrivateMessageNotification;
  first?: boolean;
}

export default function Message({ message, first }: MessageProps) {
  const dispatch = useAppDispatch();
  const { presentReport } = use(SharedDialogContext);
  const myUserId = useAppSelector(
    (state) => state.site.response?.my_user?.local_user_view?.person.id,
  );

  const privateMessage = message.data;

  const thisIsMyMessage =
    privateMessage.private_message.creator_id === myUserId;
  const thisIsASelfMessage =
    privateMessage.private_message.creator_id ===
    privateMessage.private_message.recipient_id;

  const containerRef = useRef<HTMLDivElement>(null);

  const [focused, setFocused] = useState(true);

  useIonViewWillEnter(() => setFocused(true));
  useIonViewDidLeave(() => setFocused(false));

  const onMessageLongPress = useCallback(() => {
    presentReport(privateMessage);
  }, [privateMessage, presentReport]);

  const bind = useLongPress(onMessageLongPress, { cancelOnMovement: 15 });

  // The thunk handles API call + optimistic update + counts refresh + rollback.
  const markReadEvent = useEffectEvent(() => {
    dispatch(markNotificationRead(message.notification, true));
  });

  useEffect(() => {
    if (
      message.notification.read ||
      (thisIsMyMessage && !thisIsASelfMessage) ||
      !focused
    )
      return;

    markReadEvent();
  }, [focused, message, thisIsMyMessage, thisIsASelfMessage]);

  return (
    <div
      style={{ marginTop: first ? "15px" : "0" }}
      className={cx(
        styles.container,
        thisIsMyMessage ? styles.sent : styles.received,
      )}
      ref={containerRef}
      {...bind()}
    >
      <Markdown
        id={`private-message_${privateMessage.private_message.id}`}
        className="collapse-md-margins"
      >
        {privateMessage.private_message.content}
      </Markdown>
    </div>
  );
}
