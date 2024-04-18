import { PrivateMessageView } from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import useClient from "../../../helpers/useClient";
import { getInboxCounts, receivedMessages } from "../inboxSlice";
import { useIonViewDidLeave, useIonViewWillEnter } from "@ionic/react";
import { PageContext } from "../../auth/PageContext";
import { useLongPress } from "use-long-press";
import Markdown from "../../shared/markdown/Markdown";
import { styled } from "@linaria/react";
import { css } from "@linaria/core";

const Container = styled.div`
  position: relative; /* Setup a relative container for our pseudo elements */
  max-width: min(75%, 400px);
  margin-bottom: 15px;
  padding: 10px 20px;
  line-height: 1.3;
  word-wrap: break-word; /* Make sure the text wraps to multiple lines if long */

  font-size: 1rem;

  --border-radius: 20px;

  border-radius: var(--border-radius);

  --bg: var(--ion-background-color);
  --sentColor: var(--ion-color-primary);
  --receiveColor: #eee;

  .ion-palette-dark & {
    --receiveColor: var(--ion-color-medium);
  }

  &:before {
    width: 20px;
  }

  &:after {
    width: 26px;
    background-color: var(--bg); /* All tails have the same bg cutout */
  }

  a {
    color: white;
  }

  &:before,
  &:after {
    position: absolute;
    bottom: 0;
    height: var(
      --border-radius
    ); /* height of our bubble "tail" - should match the border-radius above */
    content: "";
  }
`;

const sentCss = css`
  align-self: flex-end;
  color: white;
  background: var(--sentColor);

  &:before {
    right: -7px;
    background-color: var(--sentColor);
    border-bottom-left-radius: 16px 14px;
  }

  &:after {
    right: -26px;
    border-bottom-left-radius: 10px;
  }
`;

const receivedCss = css`
  align-self: flex-start;
  color: black;
  background: var(--receiveColor);

  &:before {
    left: -7px;
    background-color: var(--receiveColor);
    border-bottom-right-radius: 16px 14px;
  }

  &:after {
    left: -26px;
    border-bottom-right-radius: 10px;
  }
`;

interface MessageProps {
  message: PrivateMessageView;
}

export default function Message({ message }: MessageProps) {
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

  useEffect(() => {
    if (
      message.private_message.read ||
      (thisIsMyMessage && !thisIsASelfMessage) ||
      !focused
    )
      return;

    setRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, message, thisIsMyMessage]);

  async function setRead() {
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
    await dispatch(getInboxCounts());
  }

  return (
    <Container
      className={thisIsMyMessage ? sentCss : receivedCss}
      ref={containerRef}
      {...bind()}
    >
      <Markdown
        id={`private-message_${message.private_message.id}`}
        className="collapse-md-margins"
      >
        {message.private_message.content}
      </Markdown>
    </Container>
  );
}
