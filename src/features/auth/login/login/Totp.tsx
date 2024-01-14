import React, { useEffect, useRef } from "react";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

interface TotpProps {
  url: string;
  username: string;
  password: string;
}

export default function Totp({ url, username, password }: TotpProps) {
  // eslint-disable-next-line no-undef
  const totpRef = useRef<HTMLIonInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      totpRef.current?.setFocus();
    }, 300);
  });

  function submit() {}

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Log in</IonTitle>
          <IonButtons slot="end">
            <IonButton strong>Confirm</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          Enter 2nd factor auth code for {username}@{url}
        </div>

        <IonList inset>
          <IonItem>
            <IonInput
              ref={totpRef}
              autocomplete="one-time-code"
              labelPlacement="stacked"
              label="2fa code"
              enterkeyhint="done"
            />
          </IonItem>
        </IonList>
      </IonContent>
    </>
  );
}
