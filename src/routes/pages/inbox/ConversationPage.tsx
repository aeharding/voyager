import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useContext, useEffect, useMemo, useRef } from "react";
import { jwtPayloadSelector } from "../../../features/auth/authSelectors";
import { syncMessages } from "../../../features/inbox/inboxSlice";
import { useParams } from "react-router";
import { getHandle } from "../../../helpers/lemmy";
import Message from "../../../features/inbox/messages/Message";
import { maxWidthCss } from "../../../features/shared/AppContent";
import { IonContentCustomEvent } from "@ionic/core";
import { getUser } from "../../../features/user/userSlice";
import { PageContentIonSpinner } from "../../../features/user/AsyncProfile";
import { StyledLink } from "../../../features/labels/links/shared";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import ConversationsMoreActions from "../../../features/feed/ConversationsMoreActions";
import { TabContext } from "../../../core/TabContext";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { styled } from "@linaria/react";
import { css } from "@linaria/core";
import AppHeader from "../../../features/shared/AppHeader";
import SendMessageBox from "../../../features/inbox/SendMessageBox";

const Container = styled.div`
  ${maxWidthCss}

  height: 100%;

  padding: 1rem;
  height: 100%;

  font-size: 0.9rem;

  display: flex;
  flex-direction: column;
`;

const Messages = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
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

  const contentRef = useRef<IonContentCustomEvent<never>["target"]>(null);
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  useSetActivePage(pageRef);

  useIonViewWillEnter(() => {
    contentRef.current?.scrollToBottom();
  });

  useEffect(() => {
    if (userByHandle[handle]) return;

    dispatch(getUser(handle));
  }, [dispatch, handle, userByHandle]);

  useEffect(() => {
    contentRef.current?.scrollToBottom();
  }, [allMessages]);

  useEffect(() => {
    dispatch(syncMessages());
  }, [dispatch, jwtPayload]);

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
            <StyledLink
              to={buildGeneralBrowseLink(`/u/${handle}`)}
              onClick={(e) => e.stopPropagation()}
            >
              {handle}
            </StyledLink>
          </IonTitle>

          <IonButtons slot="end">
            <ConversationsMoreActions />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <IonContent ref={contentRef}>
        {typeof myUserId === "number" ? (
          <Container>
            <Messages>
              {messages.map((message) => (
                <Message key={message.private_message.id} message={message} />
              ))}
            </Messages>
          </Container>
        ) : (
          <PageContentIonSpinner />
        )}
      </IonContent>
      <IonFooter>{them && <SendMessageBox recipientId={them.id} />}</IonFooter>
    </IonPage>
  );
}
