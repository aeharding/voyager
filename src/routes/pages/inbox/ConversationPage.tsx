import {
  IonButtons,
  IonFooter,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { PrivateMessageView } from "threadiverse";
import { VListHandle } from "virtua";

import { TabContext } from "#/core/TabContext";
import { jwtPayloadSelector } from "#/features/auth/authSelectors";
import ConversationsMoreActions from "#/features/feed/ConversationsMoreActions";
import FeedLoadMoreFailed from "#/features/feed/endItems/FeedLoadMoreFailed";
import { syncMessages } from "#/features/inbox/inboxSlice";
import Message from "#/features/inbox/messages/Message";
import SendMessageBox from "#/features/inbox/SendMessageBox";
import AppHeader from "#/features/shared/AppHeader";
import { getUser } from "#/features/user/userSlice";
import { AppPage } from "#/helpers/AppPage";
import AppVList from "#/helpers/AppVList";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useKeyboardOpen from "#/helpers/useKeyboardOpen";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { AppBackButton } from "#/routes/twoColumn/AppBackButton";
import { useAppDispatch, useAppSelector } from "#/store";

import sharedLabelStyles from "#/features/labels/links/shared.module.css";
import sharedStyles from "#/features/shared/shared.module.css";
import styles from "./ConversationPage.module.css";

function useMessages(
  allMessages: PrivateMessageView[],
  myUserId: number | undefined,
  handle: string,
) {
  return useMemo(
    () =>
      allMessages
        .filter((m) =>
          m.private_message.creator_id === myUserId
            ? getHandle(m.recipient).toLowerCase() === handle.toLowerCase()
            : getHandle(m.creator).toLowerCase() === handle.toLowerCase(),
        )
        .sort(
          (a, b) =>
            Date.parse(b.private_message.published) -
            Date.parse(a.private_message.published),
        )
        .reverse(),
    [allMessages, handle, myUserId],
  );
}

export default function ConversationPage() {
  const dispatch = useAppDispatch();
  const allMessages = useAppSelector((state) => state.inbox.messages);
  const jwtPayload = useAppSelector(jwtPayloadSelector);
  const myUserId = useAppSelector(
    (state) => state.site.response?.my_user?.local_user_view?.person.id,
  );
  const tabContext = use(TabContext);
  const { handle } = useParams<{ handle: string }>();
  const userByHandle = useAppSelector((state) => state.user.userByHandle);
  const [error, setError] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  const keyboardOpen = useKeyboardOpen();

  const virtuaRef = useRef<VListHandle>(null);
  const shouldStickToBottom = useRef(true);

  const messages = useMessages(allMessages, myUserId, handle);

  const them = userByHandle[handle.toLowerCase()];

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const loadUser = useCallback(async () => {
    if (userByHandle[handle.toLowerCase()]) return;
    if (loadingUser) return;

    setLoadingUser(true);

    // TODO replace with await when React Compiler doesn't bail
    return dispatch(getUser(handle))
      .catch((error) => {
        setError(true);
        throw error;
      })
      .then(() => {
        setError(false);
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, [dispatch, handle, loadingUser, userByHandle]);

  loadUser();

  useEffect(() => {
    dispatch(syncMessages());
  }, [dispatch, jwtPayload]);

  const scrollToBottom = useCallback(() => {
    if (!virtuaRef.current) return;

    virtuaRef.current.scrollToIndex(messages.length - 1, { align: "end" });
  }, [messages]);

  const scrollIfNeeded = useCallback(() => {
    if (!shouldStickToBottom.current) return;

    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    scrollIfNeeded();
  }, [scrollIfNeeded, keyboardOpen]);

  const content = (() => {
    if (error)
      return (
        <FeedLoadMoreFailed
          fetchMore={loadUser}
          loading={loadingUser}
          pluralType="messages"
        />
      );

    if (typeof myUserId === "number" && them)
      return (
        <AppVList
          className={styles.container}
          ref={virtuaRef}
          style={{ flex: 1 }}
          reverse
          onScroll={(offset) => {
            // Wait for viewport resize to settle (iOS keyboard open/close)
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (!virtuaRef.current) return;
                shouldStickToBottom.current =
                  offset -
                    virtuaRef.current.scrollSize +
                    virtuaRef.current.viewportSize >=
                  // FIXME: The sum may not be 0 because of sub-pixel value when browser's window.devicePixelRatio has decimal value
                  -1.5;
              });
            });
          }}
        >
          {messages.map((message, index) => (
            <div
              className={styles.messageContainer}
              key={message.private_message.id}
            >
              <Message message={message} first={index === 0} />
            </div>
          ))}
        </AppVList>
      );

    return <IonSpinner className={sharedStyles.pageSpinner} />;
  })();

  const backText = (() => {
    switch (tabContext.tabRef?.current) {
      case undefined:
        return " ";
      case "inbox":
        return "Messages";
      default:
        return "Back";
    }
  })();

  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <AppBackButton defaultHref="/inbox/messages" text={backText} />
          </IonButtons>

          <IonTitle className={styles.title}>
            <Link
              className={sharedLabelStyles.link}
              to={buildGeneralBrowseLink(`/u/${handle}`)}
            >
              {handle}
            </Link>
          </IonTitle>

          <IonButtons slot="end">
            <ConversationsMoreActions person={them} />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <FeedContent>{content}</FeedContent>
      {them && (
        <IonFooter className={styles.footer}>
          <SendMessageBox
            recipient={them}
            onHeightChange={scrollIfNeeded}
            scrollToBottom={scrollToBottom}
          />
        </IonFooter>
      )}
    </AppPage>
  );
}
