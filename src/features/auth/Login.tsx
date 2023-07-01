import React, { useState, useRef, useEffect } from "react";
import {
  IonButtons,
  IonButton,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonPage,
  IonItem,
  IonInput,
  IonRadioGroup,
  IonRadio,
  IonSpinner,
  IonList,
  useIonToast,
  IonText,
  IonRouterLink,
  useIonModal,
} from "@ionic/react";
import styled from "@emotion/styled";
import { useAppDispatch } from "../../store";
import { login } from "./authSlice";
import { getClient } from "../../services/lemmy";
import { IonInputCustomEvent } from "@ionic/core";
import TermsSheet from "../settings/terms/TermsSheet";
import { LEMMY_SERVERS } from "../../helpers/lemmy";

export const Spinner = styled(IonSpinner)`
  width: 1.5rem;
`;

export const Centered = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const HelperText = styled.p`
  margin-left: 2rem;
  margin-right: 2rem;
`;

export default function Login({
  onDismiss,
}: {
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
}) {
  const [present] = useIonToast();
  const dispatch = useAppDispatch();
  const [server, setServer] = useState(LEMMY_SERVERS[0]);
  const [customServer, setCustomServer] = useState("");
  const [serverConfirmed, setServerConfirmed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const usernameRef = useRef<IonInputCustomEvent<never>["target"]>(null);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef();
  const [needsTotp, setNeedsTotp] = useState(false);
  const [totp, setTotp] = useState("");

  const [presentTerms, onDismissTerms] = useIonModal(TermsSheet, {
    onDismiss: (data: string, role: string) => onDismissTerms(data, role),
  });

  const customServerHostname = (() => {
    if (!customServer) return;

    try {
      return new URL(
        customServer.startsWith("https://")
          ? customServer
          : `https://${customServer}`
      ).hostname;
    } catch (e) {
      return undefined;
    }
  })();

  useEffect(() => {
    if (!serverConfirmed) return;

    setTimeout(() => {
      // This hack is incredibly annoying
      usernameRef.current?.getInputElement().then((el) => el.focus());
    }, 200);
  }, [serverConfirmed]);

  useEffect(() => {
    setCustomServer("");
  }, [server]);

  async function submit() {
    if (!server && !customServer) {
      present({
        message: `Please enter your instance domain name`,
        duration: 3500,
        position: "bottom",
        color: "danger",
      });
      return;
    }

    if (!serverConfirmed) {
      if (customServer) {
        if (!customServerHostname) {
          present({
            message: `${customServer} is not a valid server URL. Please try again`,
            duration: 3500,
            position: "bottom",
            color: "danger",
          });

          return;
        }

        setLoading(true);
        try {
          await getClient(customServerHostname).getSite({});
        } catch (error) {
          present({
            message: `Problem connecting to ${customServerHostname}. Please try again`,
            duration: 3500,
            position: "bottom",
            color: "danger",
          });

          throw error;
        } finally {
          setLoading(false);
        }
      }

      setServerConfirmed(true);
      return;
    }

    if (!username || !password) {
      present({
        message: "Please fill out username and password fields",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });
      return;
    }

    if (!totp && needsTotp) {
      present({
        message: `Please enter your second factor authentication code for ${username}`,
        duration: 3500,
        position: "bottom",
        color: "danger",
      });
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        login(
          getClient(server ?? customServerHostname),
          username,
          password,
          totp
        )
      );
    } catch (error) {
      if (error === "missing_totp_token") {
        setNeedsTotp(true);
        return;
      }

      present({
        message: "Please check your credentials and try again.",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    } finally {
      setLoading(false);
    }

    onDismiss();
    present({
      message: "Login successful",
      duration: 2000,
      position: "bottom",
      color: "success",
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <input type="submit" /> {/* Hack */}
      <IonPage ref={pageRef}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                color="medium"
                onClick={() => {
                  if (serverConfirmed) {
                    setServerConfirmed(false);
                    setNeedsTotp(false);
                    setUsername("");
                    setPassword("");
                    setTotp("");
                    return;
                  }

                  onDismiss();
                }}
              >
                {serverConfirmed ? "Back" : "Cancel"}
              </IonButton>
            </IonButtons>
            <IonTitle>
              <Centered>Login {loading && <Spinner color="dark" />}</Centered>
            </IonTitle>
            <IonButtons slot="end">
              <IonButton
                strong={true}
                type="submit"
                disabled={!server && !customServer}
              >
                {serverConfirmed ? "Confirm" : "Next"}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {!serverConfirmed && (
            <>
              <HelperText>Choose your account&apos;s server</HelperText>
              <IonRadioGroup
                value={server}
                onIonChange={(e) => setServer(e.target.value)}
              >
                <IonList inset>
                  {LEMMY_SERVERS.slice(0, 3).map((server) => (
                    <IonItem disabled={loading} key={server}>
                      <IonRadio value={server} key={server}>
                        {server}
                      </IonRadio>
                    </IonItem>
                  ))}
                  <IonItem disabled={loading}>
                    <IonRadio value={undefined} color="danger">
                      other
                    </IonRadio>
                  </IonItem>
                </IonList>
              </IonRadioGroup>
              {server ? (
                <></>
              ) : (
                <>
                  <IonList inset>
                    <IonItem>
                      <IonInput
                        label="URL"
                        inputMode="url"
                        value={customServer}
                        onIonInput={(e) =>
                          setCustomServer(e.target.value as string)
                        }
                        disabled={loading}
                      />
                    </IonItem>
                  </IonList>
                </>
              )}

              <HelperText>
                <IonRouterLink onClick={() => presentTerms()}>
                  Privacy &amp; Terms
                </IonRouterLink>
              </HelperText>

              <HelperText>
                <IonRouterLink
                  href="https://join-lemmy.org/instances"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IonText color="primary">Don&apos;t have an account?</IonText>
                </IonRouterLink>
              </HelperText>
            </>
          )}
          {serverConfirmed && (
            <>
              <HelperText>
                {needsTotp ? (
                  <>
                    Enter 2nd factor auth code for {username}@
                    {server ?? customServer}
                  </>
                ) : (
                  <>Login to {server ?? customServerHostname}</>
                )}
              </HelperText>
              {!needsTotp ? (
                <IonList inset>
                  <IonItem>
                    <IonInput
                      ref={usernameRef}
                      label="Username or email"
                      autocomplete="username"
                      inputMode="email"
                      value={username}
                      onIonInput={(e) => setUsername(e.target.value as string)}
                      disabled={loading}
                    />
                  </IonItem>
                  <IonItem>
                    <IonInput
                      label="Password"
                      type="password"
                      value={password}
                      onIonInput={(e) => setPassword(e.target.value as string)}
                      disabled={loading}
                      enterkeyhint="done"
                    />
                  </IonItem>
                </IonList>
              ) : (
                <IonList inset>
                  <IonItem>
                    <IonInput
                      label="2fa code"
                      value={totp}
                      onIonInput={(e) => setTotp(e.target.value as string)}
                      disabled={loading}
                      enterkeyhint="done"
                    />
                  </IonItem>
                </IonList>
              )}
            </>
          )}
        </IonContent>
      </IonPage>
    </form>
  );
}
