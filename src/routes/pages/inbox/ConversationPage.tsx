import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  KeyboardEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { jwtPayloadSelector } from "../../../features/auth/authSelectors";
import {
  receivedMessages,
  syncMessages,
} from "../../../features/inbox/inboxSlice";
import { useParams } from "react-router";
import { getHandle } from "../../../helpers/lemmy";
import Message from "../../../features/inbox/messages/Message";
import TextareaAutosize from "react-textarea-autosize";
import { arrowUp } from "ionicons/icons";
import useClient from "../../../helpers/useClient";
import {
  MaxWidthContainer,
  maxWidthCss,
} from "../../../features/shared/AppContent";
import { IonContentCustomEvent } from "@ionic/core";
import { getUser } from "../../../features/user/userSlice";
import { PageContentIonSpinner } from "../../../features/user/AsyncProfile";
import { StyledLink } from "../../../features/labels/links/shared";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import ConversationsMoreActions from "../../../features/feed/ConversationsMoreActions";
import { TabContext } from "../../../core/TabContext";
import useAppToast from "../../../helpers/useAppToast";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { styled } from "@linaria/react";
import { css } from "@linaria/core";

const MaxSizeContainer = styled(MaxWidthContainer)`
  height: 100%;
`;

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

const SendContainer = styled.div`
  position: relative;

  padding: 0.5rem;

  background: var(--ion-tab-bar-background, var(--ion-color-step-50, #f7f7f7));
  border-top: 1px solid
    var(
      --ion-tab-bar-border-color,
      var(--ion-border-color, var(--ion-color-step-150, rgba(0, 0, 0, 0.2)))
    );
`;

const InputContainer = styled.div`
  position: relative;

  display: flex;
`;

const Input = styled(TextareaAutosize)`
  border: 1px solid var(--ion-color-medium);
  border-radius: 1rem;

  // Exact px measurements to prevent
  // pixel rounding browser inconsistencies
  padding: 8px 1rem;
  line-height: 18px;
  font-size: 16px;

  background: var(--ion-background-color);
  color: var(--ion-text-color);
  outline: none;

  width: 100%;
  resize: none;
  appearance: none;
`;

const SendButton = styled(IonIcon)`
  position: absolute;
  bottom: calc(36px / 2);
  transform: translateY(50%);
  right: 4px;
  background: var(--ion-color-primary);
  height: 21px;
  width: 21px;
  border-radius: 50%;
  padding: 3px;
  color: white;
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
  const [value, setValue] = useState("");
  const client = useClient();
  const userByHandle = useAppSelector((state) => state.user.userByHandle);
  const [loading, setLoading] = useState(false);
  const presentToast = useAppToast();

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

  async function send() {
    const recipientId = userByHandle[handle]?.id;

    if (typeof recipientId !== "number") return;

    setLoading(true);

    let message;

    try {
      message = await client.createPrivateMessage({
        content: value,
        recipient_id: recipientId,
      });
    } catch (error) {
      presentToast({
        message: `Message failed to send. Please try again`,
        color: "danger",
      });
      setLoading(false);
      throw error;
    }

    dispatch(receivedMessages([message.private_message_view]));

    setLoading(false);
    setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!e.ctrlKey && !e.metaKey) return;
    if (e.key !== "Enter") return;

    send();
  }

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
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
      </IonHeader>
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
      <IonFooter>
        <SendContainer>
          <MaxSizeContainer>
            <InputContainer>
              <Input
                disabled={loading}
                placeholder="Message"
                onChange={(e) => setValue(e.target.value)}
                value={value}
                rows={1}
                maxRows={5}
                onKeyDown={onKeyDown}
              />
              {value.trim() && !loading && (
                <SendButton icon={arrowUp} onClick={send} />
              )}
            </InputContainer>
          </MaxSizeContainer>
        </SendContainer>
      </IonFooter>
    </IonPage>
  );
}
