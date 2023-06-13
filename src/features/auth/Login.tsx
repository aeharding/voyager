import React, { useState, useRef } from "react";
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

const Spinner = styled(IonSpinner)`
  width: 1.5rem;
`;

const Centered = styled.div`
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
  const [server, setServer] = useState("lemmy.ml");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!server || !username || !password) return;

    setLoading(true);

    try {
      await dispatch(
        login(new LemmyHttp(`/api/${server}`), username, password)
      );
    } catch (error) {
      if (error === "couldnt_find_that_username_or_email")
        present({
          message:
            "Could not find a username with those credentials. Please try again.",
          duration: 3500,
          position: "bottom",
          color: "danger",
        });

      throw error;
    } finally {
      setLoading(false);
    }

    onDismiss(inputRef.current?.value, "confirm");
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
                onClick={() => onDismiss(null, "cancel")}
              >
                Cancel
              </IonButton>
            </IonButtons>
            <IonTitle>
              <Centered>Login {loading && <Spinner color="dark" />}</Centered>
            </IonTitle>
            <IonButtons slot="end">
              <IonButton strong={true} type="submit">
                Confirm
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <HelperText>Choose your account's server</HelperText>
          <IonRadioGroup
            value={server}
            onIonChange={(e) => setServer(e.target.value)}
          >
            <IonList inset>
              {SUPPORTED_SERVERS.map((server) => (
                <IonItem disabled={loading}>
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
          <br />
          {server ? (
            <>
              <HelperText>Login to {server}</HelperText>
              <IonList inset>
                <IonItem>
                  <IonInput
                    ref={inputRef}
                    label="Username or email"
                    autocomplete="username"
                    inputMode="email"
                    value={username}
                    onIonChange={(e) => setUsername(e.target.value as string)}
                    disabled={loading}
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    ref={inputRef}
                    label="Password"
                    type="password"
                    value={password}
                    onIonChange={(e) => setPassword(e.target.value as string)}
                    disabled={loading}
                  />
                </IonItem>
              </IonList>
            </>
          ) : (
            <>
              <HelperText>
                Unfortunately, we currently only support servers from this list
                because Lemmy does not support CORS, and we have to proxy every
                request made through wefwef.
              </HelperText>
              <HelperText>
                Proxying arbitrary requests to any server on the internet would
                be a liability for hosting.
              </HelperText>
              <HelperText>
                We will work to expand this list over time.
              </HelperText>
            </>
          )}
        </IonContent>
      </IonPage>
    </form>
  );
}
