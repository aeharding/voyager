import {
  IonBackButton,
  IonButtons,
  IonFooter,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { jwtPayloadSelector } from "../../../features/auth/authSelectors";
import { syncMessages } from "../../../features/inbox/inboxSlice";
import { useParams } from "react-router";
import { getHandle } from "../../../helpers/lemmy";
import Message from "../../../features/inbox/messages/Message";
import { maxWidthCss } from "../../../features/shared/AppContent";
import { getUser } from "../../../features/user/userSlice";
import { PageContentIonSpinner } from "../../../features/user/AsyncProfile";
import { StyledLink } from "../../../features/labels/links/shared";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import ConversationsMoreActions from "../../../features/feed/ConversationsMoreActions";
import { TabContext } from "../../../core/TabContext";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { css } from "@linaria/core";
import AppHeader from "../../../features/shared/AppHeader";
import SendMessageBox from "../../../features/inbox/SendMessageBox";
import FeedContent from "../shared/FeedContent";
import { CustomItemComponent, VList, VListHandle } from "virtua";
import { styled } from "@linaria/react";
import useKeyboardOpen from "../../../helpers/useKeyboardOpen";

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

  const keyboardOpen = useKeyboardOpen();

  const ref = useRef<VListHandle>(null);
  const shouldStickToBottom = useRef(true);

  const messages = useMemo(
    () =>
      allMessages
        .filter((m) =>
          m.private_message.creator_id === myUserId
            ? getHandle(m.recipient) === handle
            : getHandle(m.creator) === handle,
        )
        .sort(
          (a, b) =>
            Date.parse(b.private_message.published) -
            Date.parse(a.private_message.published),
        )
        .reverse(),
    [handle, allMessages, myUserId],
  );

  const them = userByHandle[handle];

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  useSetActivePage(pageRef);

  useEffect(() => {
    if (userByHandle[handle]) return;

    dispatch(getUser(handle));
  }, [dispatch, handle, userByHandle]);

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
      <FeedContent>
        {typeof myUserId === "number" ? (
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
                    offset -
                      ref.current.scrollSize +
                      ref.current.viewportSize >=
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
        ) : (
          <PageContentIonSpinner />
        )}
      </FeedContent>
      <IonFooter
        className={css`
          background: var(--ion-background-color);
        `}
      >
        {them && (
          <SendMessageBox
            recipient={them}
            onHeightChange={scrollIfNeeded}
            scrollToBottom={scrollToBottom}
          />
        )}
      </IonFooter>
    </IonPage>
  );
}
