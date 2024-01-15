import React, { useContext, useEffect, useRef, useState } from "react";
import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import useAppToast from "../../../../helpers/useAppToast";
import { useAppDispatch } from "../../../../store";
import { login } from "../../authSlice";
import {
  OldLemmyErrorValue,
  getLoginErrorMessage,
  isLemmyError,
} from "../../../../helpers/lemmy";
import Totp from "./Totp";
import { DynamicDismissableModalContext } from "../../../shared/DynamicDismissableModal";
import InAppExternalLink from "../../../shared/InAppExternalLink";
import { HelperText } from "../../../settings/shared/formatting";
import { getImageSrc } from "../../../../services/lemmy";
import { loginSuccess } from "../../../../helpers/toastMessages";

interface LoginProps {
  url: string;
  siteIcon: string | undefined;
}

export default function Login({ url, siteIcon }: LoginProps) {
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();

  const { dismiss, setCanDismiss } = useContext(DynamicDismissableModalContext);

  // eslint-disable-next-line no-undef
  const usernameRef = useRef<HTMLIonInputElement>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      usernameRef.current?.setFocus();
    }, 300);
  }, []);

  async function submit() {
    if (!username || !password) {
      presentToast({
        message: "Please fill out username and password fields",
        color: "danger",
        fullscreen: true,
      });
      return;
    }

    setLoading(true);

    try {
      await dispatch(login(url, username, password));
    } catch (error) {
      if (isLemmyError(error, "missing_totp_token")) {
        usernameRef.current
          ?.closest("ion-nav")
          ?.push(() => (
            <Totp url={url} username={username} password={password} />
          ));
        return;
      }

      if (
        isLemmyError(error, "password_incorrect" as OldLemmyErrorValue) || // TODO lemmy v0.18 support
        isLemmyError(error, "incorrect_login")
      ) {
        setPassword("");
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
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Log in</IonTitle>
          <IonButtons slot="end">
            {loading ? (
              <IonSpinner />
            ) : (
              <IonButton strong onClick={submit}>
                Confirm
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          You are logging in to{" "}
          <InAppExternalLink
            href={`https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IonChip outline>
              {siteIcon && (
                <IonAvatar>
                  <img src={getImageSrc(siteIcon, { size: 24 })} />
                </IonAvatar>
              )}
              <IonLabel>{url}</IonLabel>
            </IonChip>
          </InAppExternalLink>
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
                ref={usernameRef}
                autocomplete="username"
                labelPlacement="stacked"
                label="Username or email"
                inputMode="email"
                value={username}
                onIonInput={(e) => setUsername(e.detail.value || "")}
              />
            </IonItem>
          </IonList>
          <IonList inset>
            <IonItem>
              <IonInput
                type="password"
                labelPlacement="stacked"
                label="Password"
                autocomplete="current-password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value || "")}
                enterkeyhint="done"
              />
            </IonItem>
          </IonList>
        </form>

        <HelperText>
          By using Voyager, you agree to the{" "}
          <InAppExternalLink
            href="https://getvoyager.app/terms.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Use
          </InAppExternalLink>
        </HelperText>
      </IonContent>
    </>
  );
}
