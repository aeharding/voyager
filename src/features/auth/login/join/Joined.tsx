import React from "react";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonNavLink,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Login from "../login/Login";
import { useAppSelector } from "../../../../store";

export default function Joined() {
  const { url, site } = useAppSelector((state) => state.join);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>✅ Success</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar color=" ">
            <IonTitle size="large">✅ Success!</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          <p>
            ✨ Your request for an account was successfully submitted!{" "}
            <strong>
              Keep an eye out for the email to activate your account.
            </strong>
          </p>
        </div>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonNavLink
            component={() =>
              url && <Login url={url} siteIcon={site?.site_view.site.icon} />
            }
          >
            <IonButton expand="block">Login</IonButton>
          </IonNavLink>
        </IonToolbar>
      </IonFooter>
    </>
  );
}
