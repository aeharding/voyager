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
  useIonModal,
  IonRadioGroup,
  IonRadio,
  IonIcon,
  IonPopover,
  IonSpinner,
} from "@ionic/react";
import { OverlayEventDetail } from "@ionic/core/components";
import { help, helpCircle, helpCircleOutline } from "ionicons/icons";
import styled from "@emotion/styled";
import { SUPPORTED_SERVERS } from "../../helpers/lemmy";
import { useAppDispatch } from "../../store";
import { login } from "./authSlice";
import { client } from "../../services/lemmy";
import { LemmyHttp } from "lemmy-js-client";

const HelpIcon = styled(IonIcon)`
  color: var(--ion-color-primary);
  font-size: 1.1em;
  width: 1.3rem;
  height: 1.3rem;
`;

export default function Login({
  onDismiss,
}: {
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
}) {
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
    } finally {
      setLoading(false);
    }

    onDismiss(inputRef.current?.value, "confirm");
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton color="medium" onClick={() => onDismiss(null, "cancel")}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>Login</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={submit} strong={true}>
              {loading && <IonSpinner color="dark" />} Confirm
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>Choose your account's server</p>

        <IonRadioGroup
          value={server}
          onIonChange={(e) => setServer(e.target.value)}
        >
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
        </IonRadioGroup>

        <br />

        {server ? (
          <>
            <p>Login to {server}</p>
            <IonItem>
              <IonInput
                ref={inputRef}
                labelPlacement="stacked"
                label="Username or email"
                value={username}
                onIonChange={(e) => setUsername(e.target.value as string)}
                disabled={loading}
              />
            </IonItem>
            <IonItem>
              <IonInput
                ref={inputRef}
                labelPlacement="stacked"
                label="Password"
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.target.value as string)}
                disabled={loading}
              />
            </IonItem>
          </>
        ) : (
          <>
            <p>
              Unfortunately, we only allow servers from this list because Lemmy
              does not support CORS, and we have to proxy every request made
              through wefwef.
            </p>
            <p>We hope to eventually expand this list to all Lemmy servers.</p>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
