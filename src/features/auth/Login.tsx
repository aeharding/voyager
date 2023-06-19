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
} from "@ionic/react";
import styled from "@emotion/styled";
import { SUPPORTED_SERVERS } from "../../helpers/lemmy";
import { useAppDispatch } from "../../store";
import { login } from "./authSlice";
import { LemmyHttp } from "lemmy-js-client";

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
  const [server, setServer] = useState(SUPPORTED_SERVERS[0]);
  const [serverConfirmed, setServerConfirmed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const usernameRef = useRef<HTMLIonInputElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serverConfirmed) return;

    setTimeout(() => {
      // This hack is incredibly annoying
      usernameRef.current?.getInputElement().then((el) => el.focus());
    }, 200);
  }, [serverConfirmed]);

  async function submit() {
    if (!server) return;

    if (!serverConfirmed) {
      setServerConfirmed(true);
      return;
    }

    if (!server || !username || !password) {
      present({
        message: "Please fill out username and password fields",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        login(new LemmyHttp(`/api/${server}`), username, password)
      );
    } catch (error) {
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
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                color="medium"
                onClick={() => {
                  if (serverConfirmed) {
                    setServerConfirmed(false);
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
              <IonButton strong={true} type="submit" disabled={!server}>
                {serverConfirmed ? "Confirm" : "Next"}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {!serverConfirmed && (
            <>
              <HelperText>Choose your account's server</HelperText>
              <IonRadioGroup
                value={server}
                onIonChange={(e) => setServer(e.target.value)}
              >
                <IonList inset>
                  {SUPPORTED_SERVERS.map((server) => (
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
                <>
                  <HelperText>
                    Note: All requests to <strong>{server}</strong> will be
                    proxied through <strong>{location.hostname}</strong>.
                  </HelperText>
                </>
              ) : (
                <>
                  <HelperText>
                    Unfortunately, we currently only support servers from this
                    list because Lemmy does not support CORS, and we have to
                    proxy every request made through wefwef.
                  </HelperText>
                  <HelperText>
                    Proxying arbitrary requests to any server on the internet
                    would be a liability for hosting.
                  </HelperText>
                  <HelperText>
                    We will work to expand this list over time.
                  </HelperText>
                </>
              )}
            </>
          )}
          {serverConfirmed && (
            <>
              <HelperText>Login to {server}</HelperText>
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
            </>
          )}
        </IonContent>
      </IonPage>
    </form>
  );
}
