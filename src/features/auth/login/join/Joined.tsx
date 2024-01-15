import React, { useContext, useEffect } from "react";
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
import useHapticFeedback from "../../../../helpers/useHapticFeedback";
import { NotificationType } from "@capacitor/haptics";
import { DynamicDismissableModalContext } from "../../../shared/DynamicDismissableModal";

interface JoinedProps {
  verifyEmailSent: boolean;
}

export default function Joined({ verifyEmailSent }: JoinedProps) {
  const vibrate = useHapticFeedback();
  const { setCanDismiss } = useContext(DynamicDismissableModalContext);
  const { url, site } = useAppSelector((state) => state.join);

  useEffect(() => {
    vibrate({ type: NotificationType.Success });
    setCanDismiss(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>✅ Success!</IonTitle>
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
              {verifyEmailSent
                ? "Keep an eye out for an email to activate your account."
                : "Please wait for your account to be approved before you can log in."}
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
