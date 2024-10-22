import { useContext, useEffect, useRef } from "react";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonNavLink,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Login from "../login/Login";
import { useAppSelector } from "../../../../store";
import useHapticFeedback from "../../../../helpers/useHapticFeedback";
import { NotificationType } from "@capacitor/haptics";
import { DynamicDismissableModalContext } from "../../../shared/DynamicDismissableModal";
import AppHeader from "../../../shared/AppHeader";

interface JoinedProps {
  verifyEmailSent: boolean;
}

export default function Joined({ verifyEmailSent }: JoinedProps) {
  const vibrate = useHapticFeedback();
  const { setCanDismiss } = useContext(DynamicDismissableModalContext);
  const { url, site } = useAppSelector((state) => state.join);
  const vibratedRef = useRef(false);

  useEffect(() => {
    if (vibratedRef.current) return;
    vibratedRef.current = true;
    vibrate({ type: NotificationType.Success });
    setCanDismiss(true);
  }, [setCanDismiss, vibrate]);

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>✅ Success!</IonTitle>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <AppHeader collapse="condense">
          <IonToolbar color=" ">
            <IonTitle size="large">✅ Success!</IonTitle>
          </IonToolbar>
        </AppHeader>

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
