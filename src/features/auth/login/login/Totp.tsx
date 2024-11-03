import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext, useEffect, useRef, useState } from "react";

import AppHeader from "#/features/shared/AppHeader";
import { DynamicDismissableModalContext } from "#/features/shared/DynamicDismissableModal";
import { getLoginErrorMessage, isLemmyError } from "#/helpers/lemmyErrors";
import { loginSuccess } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { useAppDispatch } from "#/store";

import { login } from "../../authSlice";

interface TotpProps {
  url: string;
  username: string;
  password: string;
}

export default function Totp({ url, username, password }: TotpProps) {
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();
  const { setCanDismiss, dismiss } = useContext(DynamicDismissableModalContext);

  const totpRef = useRef<HTMLIonInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [totp, setTotp] = useState("");

  useEffect(() => {
    setTimeout(() => {
      totpRef.current?.setFocus();
    }, 300);
  }, []);

  async function submit() {
    if (!totp) {
      presentToast({
        message: "Please enter 2fa code",
        color: "danger",
        fullscreen: true,
      });
      return;
    }

    setLoading(true);

    try {
      await dispatch(login(url, username, password, totp));
    } catch (error) {
      if (
        isLemmyError(error, "incorrect_totp_token") ||
        isLemmyError(error, "incorrect_login")
      ) {
        setTotp("");
      }

      presentToast({
        message: getLoginErrorMessage(error, url),
        color: "danger",
        fullscreen: true,
      });

      throw error;
    } finally {
      setLoading(false);
    }

    presentToast(loginSuccess);

    setCanDismiss(true);
    dismiss();
  }

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>2fa code</IonTitle>
          <IonButtons slot="end">
            {loading ? (
              <IonSpinner />
            ) : (
              <IonButton strong disabled={!totp} onClick={submit}>
                Confirm
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <div className="ion-padding">
          Enter 2nd factor auth code for {username}@{url}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <input type="submit" className="ion-hide" /> {/* Hack */}
          <IonList inset>
            <IonItem>
              <IonInput
                ref={totpRef}
                autocomplete="one-time-code"
                inputMode="numeric"
                labelPlacement="stacked"
                label="2fa code"
                enterkeyhint="done"
                value={totp}
                onIonInput={(e) => setTotp(e.detail.value || "")}
              />
            </IonItem>
          </IonList>
        </form>
      </IonContent>
    </>
  );
}
