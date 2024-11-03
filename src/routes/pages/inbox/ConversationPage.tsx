import {
  IonBackButton,
  IonButtons,
  IonFooter,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router";
import { CustomItemComponent, VList, VListHandle } from "virtua";

import { TabContext } from "#/core/TabContext";
import { useSetActivePage } from "#/features/auth/AppContext";
import { jwtPayloadSelector } from "#/features/auth/authSelectors";
import ConversationsMoreActions from "#/features/feed/ConversationsMoreActions";
import FeedLoadMoreFailed from "#/features/feed/endItems/FeedLoadMoreFailed";
import SendMessageBox from "#/features/inbox/SendMessageBox";
import { syncMessages } from "#/features/inbox/inboxSlice";
import Message from "#/features/inbox/messages/Message";
import { StyledLink } from "#/features/labels/links/shared";
import { maxWidthCss } from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { PageContentIonSpinner } from "#/features/user/AsyncProfile";
import { getUser } from "#/features/user/userSlice";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useKeyboardOpen from "#/helpers/useKeyboardOpen";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { useAppDispatch, useAppSelector } from "#/store";

const containerCss = css`
  ${maxWidthCss}

  height: 100%;
  height: 100%;

  font-size: 0.9rem;

  display: flex;
  flex-direction: column;
`;

const FlexItem = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 16px !important;
`;

export default function ConversationPage() {
  const pageRef = useRef<HTMLElement>(null);
  const dispatch = useAppDispatch();
  const allMessages = useAppSelector((state) => state.inbox.messages);
  const jwtPayload = useAppSelector(jwtPayloadSelector);
  const { tabRef } = useContext(TabContext);
  const myUserId = useAppSelector(
    (state) =>
      state.site.response?.my_user?.local_user_view?.local_user?.person_id,
  );
  const { handle } = useParams<{ handle: string }>();
  const userByHandle = useAppSelector((state) => state.user.userByHandle);
  const [error, setError] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  const keyboardOpen = useKeyboardOpen();

  const ref = useRef<VListHandle>(null);
  const shouldStickToBottom = useRef(true);

  const messages = useMemo(
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
    [handle, allMessages, myUserId],
  );

  const them = userByHandle[handle.toLowerCase()];

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  useSetActivePage(pageRef);

  const loadUser = useCallback(async () => {
    if (userByHandle[handle.toLowerCase()]) return;

    setLoadingUser(true);

    try {
      await dispatch(getUser(handle));
    } catch (error) {
      setError(true);
      throw error;
    } finally {
      setLoadingUser(false);
    }

    setError(false);
  }, [dispatch, handle, userByHandle]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    dispatch(syncMessages());
  }, [dispatch, jwtPayload]);

  const scrollToBottom = useCallback(() => {
    if (!ref.current) return;

    ref.current.scrollToIndex(messages.length - 1, { align: "end" });
  }, [messages.length]);

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
        <VList
          className={containerCss}
          ref={ref}
          style={{ flex: 1 }}
          reverse
          onScroll={(offset) => {
            // Wait for viewport resize to settle (iOS keyboard open/close)
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (!ref.current) return;
                shouldStickToBottom.current =
                  offset - ref.current.scrollSize + ref.current.viewportSize >=
                  // FIXME: The sum may not be 0 because of sub-pixel value when browser's window.devicePixelRatio has decimal value
                  -1.5;
              });
            });
          }}
          item={FlexItem as unknown as CustomItemComponent}
        >
          {messages.map((message, index) => (
            <Message
              key={message.private_message.id}
              message={message}
              first={index === 0}
            />
          ))}
        </VList>
      );

    return <PageContentIonSpinner />;
  })();

  return (
    <IonPage ref={pageRef}>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/inbox/messages"
              text={tabRef?.current === "inbox" ? "Messages" : "Back"}
            />
          </IonButtons>

          <IonTitle
            className={css`
              padding-inline-start: 120px !important;
              padding-inline-end: 120px;
            `}
          >
            <StyledLink to={buildGeneralBrowseLink(`/u/${handle}`)}>
              {handle}
            </StyledLink>
          </IonTitle>

          <IonButtons slot="end">
            <ConversationsMoreActions />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <FeedContent>{content}</FeedContent>
      {them && (
        <IonFooter
          className={css`
            background: var(--ion-background-color);
          `}
        >
          <SendMessageBox
            recipient={them}
            onHeightChange={scrollIfNeeded}
            scrollToBottom={scrollToBottom}
          />
        </IonFooter>
      )}
    </IonPage>
  );
}
