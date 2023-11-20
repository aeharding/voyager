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
  IonText,
  IonRouterLink,
  useIonModal,
} from "@ionic/react";
import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "../../store";
import { login } from "./authSlice";
import { getClient } from "../../services/lemmy";
import { IonInputCustomEvent } from "@ionic/core";
import TermsSheet from "../settings/terms/TermsSheet";
import { preventPhotoswipeGalleryFocusTrap } from "../gallery/GalleryImg";
import { getCustomServers } from "../../services/app";
import { isNative } from "../../helpers/device";
import { Browser } from "@capacitor/browser";
import useAppToast from "../../helpers/useAppToast";
import {
  LemmyErrorValue,
  OldLemmyErrorValue,
  isLemmyError,
} from "../../helpers/lemmy";

const JOIN_LEMMY_URL = "https://join-lemmy.org/instances";

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
  font-size: 0.9375em;
  margin-left: 1.5rem;
  margin-right: 1.5rem;
`;

export default function Login({
  onDismiss,
}: {
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
}) {
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();
  const [servers] = useState(getCustomServers());
  const { connectedInstance } = useAppSelector((state) => state.auth);
  const [server, setServer] = useState(connectedInstance);
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

  function presentNativeTerms() {
    Browser.open({ url: "https://getvoyager.app/terms.html" });
  }

  const customServerHostname = (() => {
    if (!customServer) return;

    try {
      return new URL(
        customServer.startsWith("https://")
          ? customServer
          : `https://${customServer}`,
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
      presentToast({
        message: "Please enter your instance domain name",
        color: "danger",
        fullscreen: true,
      });
      return;
    }

    if (!serverConfirmed) {
      if (customServer) {
        if (!customServerHostname) {
          presentToast({
            message: `${customServer} is not a valid server URL. Please try again`,
            color: "danger",
            fullscreen: true,
          });

          return;
        }

        setLoading(true);
        try {
          await getClient(customServerHostname).getSite();
        } catch (error) {
          presentToast({
            message: `Problem connecting to ${customServerHostname}. Please try again`,
            color: "danger",
            fullscreen: true,
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
      presentToast({
        message: "Please fill out username and password fields",
        color: "danger",
        fullscreen: true,
      });
      return;
    }

    if (!totp && needsTotp) {
      presentToast({
        message: `Please enter your second factor authentication code for ${username}`,
        color: "danger",
        fullscreen: true,
      });
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        login(server ?? customServerHostname, username, password, totp),
      );
    } catch (error) {
      if (isLemmyError(error, "missing_totp_token")) {
        setNeedsTotp(true);
        return;
      }

      if (
        isLemmyError(error, "password_incorrect" as OldLemmyErrorValue) || // TODO lemmy v0.18 support
        isLemmyError(error, "incorrect_login")
      ) {
        setPassword("");
      }

      presentToast({
        message: getLoginErrorMessage(error, server ?? customServer),
        color: "danger",
        fullscreen: true,
      });

      throw error;
    } finally {
      setLoading(false);
    }

    onDismiss();
    presentToast({
      message: "Login successful",
      color: "success",
    });
  }

  return (
    <form
      {...preventPhotoswipeGalleryFocusTrap}
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
                  {servers.map((server) => (
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

              {isNative() ? (
                <HelperText>
                  By using Voyager, you agree to the{" "}
                  <IonRouterLink onClick={presentNativeTerms}>
                    Terms of Use
                  </IonRouterLink>
                </HelperText>
              ) : (
                <HelperText>
                  <IonRouterLink onClick={() => presentTerms()}>
                    Privacy &amp; Terms
                  </IonRouterLink>
                </HelperText>
              )}

              <HelperText>
                <IonRouterLink
                  href={JOIN_LEMMY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!isNative()) return;

                    e.preventDefault();

                    Browser.open({ url: JOIN_LEMMY_URL });
                  }}
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
                      autocomplete="current-password"
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
                      autocomplete="one-time-code"
                      inputMode="numeric"
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

function getLoginErrorMessage(error: unknown, instanceActorId: string): string {
  if (!(error instanceof Error))
    return "Unknown error occurred, please try again.";

  switch (error.message as LemmyErrorValue) {
    // TODO old lemmy support
    case "incorrect_totp token" as OldLemmyErrorValue:
    case "incorrect_totp_token":
      return "Incorrect 2nd factor code. Please try again.";
    // TODO old lemmy support
    case "couldnt_find_that_username_or_email" as OldLemmyErrorValue:
    case "couldnt_find_person":
      return `User not found. Is your account on ${instanceActorId}?`;
    case "password_incorrect" as OldLemmyErrorValue:
      return "Incorrect password. Please try again.";
    case "incorrect_login":
      return "Incorrect login credentials. Please try again.";
    case "email_not_verified":
      return `Email not verified. Please check your inbox. Request a new verification email from https://${instanceActorId}.`;
    case "site_ban":
      return "You have been banned.";
    case "deleted":
      return "Account deleted.";
    default:
      return "Connection error, please try again.";
  }
}
