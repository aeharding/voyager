import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../store";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { jwtSelector } from "../../features/auth/authSlice";
import { useParams } from "react-router";
import { getHandle } from "../../helpers/lemmy";
import { MessageContainer } from "../../features/inbox/messages/Message";
import { arrowUp, checkmarkOutline, closeOutline } from "ionicons/icons";
import useClient from "../../helpers/useClient";
import { IonContentCustomEvent } from "@ionic/core";
import { css } from "@emotion/react";
import { PageContentIonSpinner } from "../shared/UserPage";
import {
  Container,
  Input,
  InputContainer,
  MaxSizeContainer,
  Messages,
  SendButton,
  SendContainer,
} from "./ConversationPage";
import styled from "@emotion/styled";
import { acceptedApplication } from "../../features/registration-applications/registrationApplicationSlice";
import { RegistrationApplicationResponse } from "lemmy-js-client";

const ReplyButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const Tag = styled.div`
  margin-left: 0.5rem;
  padding: 0.25rem 1rem;
  border-radius: 1rem;
  color: white;
  font-size: 14px;
  font-weight: 500;
`;

const ApprovedTag = styled(Tag)`
  background-color: var(--ion-color-success);
  color: black;
`;

const DeniedTag = styled(Tag)`
  background-color: var(--ion-color-danger);
`;

const PendingTag = styled(Tag)`
  background-color: var(--ion-color-primary);
`;

export default function ApplicationMessagePage() {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const myUserId = useAppSelector(
    (state) => state.auth.site?.my_user?.local_user_view?.local_user?.person_id
  );
  const { handle } = useParams<{ handle: string }>();
  const [value, setValue] = useState("");
  const client = useClient();
  const [loading, setLoading] = useState(false);
  const [present] = useIonToast();
  const [showDenyInput, setShowDenyInput] = useState<boolean>(false);

  const router = useIonRouter();

  const contentRef = useRef<IonContentCustomEvent<never>["target"]>(null);

  const registrationApplication = useAppSelector((state) =>
    state.registrationApplication.applications.find(
      (a) => getHandle(a.creator) === handle
    )
  );

  const siteAdmins = useAppSelector((state) => state.auth.site?.admins) ?? [];
  const siteAdminWhoApproved = siteAdmins.find(
    (a) =>
      a.person.id === registrationApplication?.registration_application.admin_id
  );

  useEffect(() => {
    // If there is no application, they have refreshed the page so just redirect to the applications page
    if (!registrationApplication) {
      router.push(`/inbox/applications`);
    }
  }, [router, registrationApplication]);

  async function send(approve: boolean) {
    const id = registrationApplication?.registration_application.id;

    if (typeof id !== "number") return;
    if (!jwt) return;

    if (!approve) {
      setShowDenyInput(false);
    }

    setLoading(true);

    let response: RegistrationApplicationResponse | undefined;

    try {
      response = await client.approveRegistrationApplication({
        id,
        approve,
        deny_reason: !approve ? value : "",
        auth: jwt,
      });
    } catch (error) {
      present({
        message: `Approval failed. Please try again`,
        duration: 3500,
        position: "bottom",
        color: "danger",
      });
      setLoading(false);
      throw error;
    }

    if (response) {
      dispatch(acceptedApplication(response.registration_application));
    }

    setLoading(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!e.ctrlKey && !e.metaKey) return;
    if (e.key !== "Enter") return;

    send(false);
  }

  const isApproved =
    registrationApplication &&
    siteAdminWhoApproved &&
    registrationApplication.creator_local_user.accepted_application;

  const isDenied =
    registrationApplication &&
    siteAdminWhoApproved &&
    !registrationApplication.creator_local_user.accepted_application;

  const isPending =
    registrationApplication &&
    !registrationApplication.registration_application.admin_id;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/inbox/applications/unread"
              text="Applications"
            />
          </IonButtons>

          <IonTitle
            css={css`
              padding-inline-start: 120px !important;
              padding-inline-end: 120px;
            `}
          >
            {handle}
          </IonTitle>

          <IonButtons slot="end">
            {isApproved && <ApprovedTag>Approved</ApprovedTag>}
            {isDenied && <DeniedTag>Denied</DeniedTag>}
            {isPending && <PendingTag>Pending</PendingTag>}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef}>
        {typeof myUserId === "number" ? (
          <Container>
            <Messages>
              {registrationApplication && (
                <>
                  <MessageContainer type="recieved">
                    {registrationApplication.registration_application.answer}
                  </MessageContainer>

                  {isApproved && (
                    <MessageContainer type="sent">
                      {`Accepted by ${getHandle(siteAdminWhoApproved.person)}`}
                    </MessageContainer>
                  )}

                  {isDenied && (
                    <MessageContainer type="sent">
                      {`Denied: Reason - "${registrationApplication.registration_application.deny_reason}"`}
                    </MessageContainer>
                  )}
                </>
              )}
            </Messages>
          </Container>
        ) : (
          <PageContentIonSpinner />
        )}
      </IonContent>
      <IonFooter>
        <SendContainer>
          <MaxSizeContainer>
            <ReplyButtonsContainer>
              {!isApproved && (
                <IonButton
                  color="success"
                  onClick={() => {
                    send(true);
                  }}
                  disabled={loading}
                >
                  <IonIcon
                    icon={checkmarkOutline}
                    css={css`
                      margin-right: 0.65rem;
                    `}
                  />{" "}
                  Approve
                </IonButton>
              )}

              {!isDenied && (
                <IonButton
                  color="danger"
                  onClick={() => {
                    setShowDenyInput(true);
                  }}
                  disabled={loading}
                >
                  <IonIcon
                    icon={closeOutline}
                    css={css`
                      margin-right: 0.65rem;
                    `}
                  />{" "}
                  Deny
                </IonButton>
              )}
            </ReplyButtonsContainer>

            {showDenyInput && (
              <InputContainer>
                <Input
                  disabled={loading}
                  placeholder="Denial reason"
                  onChange={(e) => setValue(e.target.value)}
                  value={value}
                  rows={1}
                  maxRows={5}
                  onKeyDown={onKeyDown}
                />
                {value.trim() && !loading && (
                  <SendButton icon={arrowUp} onClick={() => send(false)} />
                )}
              </InputContainer>
            )}
          </MaxSizeContainer>
        </SendContainer>
      </IonFooter>
    </IonPage>
  );
}
