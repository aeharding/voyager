import { useIonViewDidLeave, useIonViewWillEnter } from "@ionic/react";
import { PrivateMessageView } from "lemmy-js-client";
import {
  useCallback,
  useContext,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useRef,
  useState,
} from "react";
import { useLongPress } from "use-long-press";

import { PageContext } from "#/features/auth/PageContext";
import Markdown from "#/features/shared/markdown/Markdown";
import { cx } from "#/helpers/css";
import useClient from "#/helpers/useClient";
import { useAppDispatch, useAppSelector } from "#/store";

import { getInboxCounts, receivedMessages } from "../inboxSlice";

import styles from "./Message.module.css";

interface MessageProps {
  message: PrivateMessageView;
  first?: boolean;
}

export default function Message({ message, first }: MessageProps) {
  const dispatch = useAppDispatch();
  const { presentReport } = useContext(PageContext);
  const myUserId = useAppSelector(
    (state) =>
      state.site.response?.my_user?.local_user_view?.local_user?.person_id,
  );

  const thisIsMyMessage = message.private_message.creator_id === myUserId;
  const thisIsASelfMessage =
    message.private_message.creator_id === message.private_message.recipient_id;
  const [loading, setLoading] = useState(false);
  const client = useClient();

  const containerRef = useRef<HTMLDivElement>(null);

  const [focused, setFocused] = useState(true);

  useIonViewWillEnter(() => setFocused(true));
  useIonViewDidLeave(() => setFocused(false));

  const onMessageLongPress = useCallback(() => {
    presentReport(message);
  }, [message, presentReport]);

  const bind = useLongPress(onMessageLongPress, { cancelOnMovement: 15 });

  const setReadEvent = useEffectEvent(async () => {
    if (loading) return;

    setLoading(true);

    let response;

    try {
      response = await client.markPrivateMessageAsRead({
        private_message_id: message.private_message.id,
        read: true,
      });
    } finally {
      setLoading(false);
    }

    await dispatch(receivedMessages([response.private_message_view]));
    await dispatch(getInboxCounts(true));
  });

  useEffect(() => {
    if (
      message.private_message.read ||
      (thisIsMyMessage && !thisIsASelfMessage) ||
      !focused
    )
      return;

    setReadEvent();
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
        id={`private-message_${message.private_message.id}`}
        className="collapse-md-margins"
      >
        {message.private_message.content}
      </Markdown>
    </div>
  );
}
