import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonActionSheet,
} from "@ionic/react";
import { use, useEffect, useRef, useState } from "react";

import { HelperText } from "#/features/settings/shared/formatting";
import AppHeader from "#/features/shared/AppHeader";
import { DynamicDismissableModalContext } from "#/features/shared/DynamicDismissableModal";
import InAppExternalLink from "#/features/shared/InAppExternalLink";
import { getLoginErrorMessage, isLemmyError } from "#/helpers/lemmyErrors";
import { loginSuccess } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { VOYAGER_TERMS } from "#/helpers/voyager";
import { buildBaseLemmyUrl } from "#/services/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

import { getInstanceFromHandle } from "../../authSelectors";
import { addGuestInstance, login } from "../../authSlice";
import LoginAvatarImg from "./LoginAvatarImg";
import Totp from "./Totp";

interface LoginProps {
  url: string;
  siteIcon: string | undefined;
}

export default function Login({ url, siteIcon }: LoginProps) {
  const [presentActionSheet] = useIonActionSheet();
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();

  const { dismiss, setCanDismiss } = use(DynamicDismissableModalContext);

  const usernameRef = useRef<HTMLIonInputElement>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const accounts = useAppSelector((state) => state.auth.accountData?.accounts);

  useEffect(() => {
    setTimeout(() => {
      usernameRef.current?.setFocus();
    }, 300);
  }, []);

  async function submit() {
    const alreadyLoggedIn = accounts?.some(
      (a) => getInstanceFromHandle(a.handle) === url,
    );

    if (!username && !password && !alreadyLoggedIn) {
      presentActionSheet({
        buttons: [
          {
            text: "Connect as Guest",
            handler: () => {
              (async () => {
                setLoading(true);

                try {
                  await dispatch(addGuestInstance(url));
                } finally {
                  setLoading(false);
                }

                setCanDismiss(true);
                dismiss();
              })();
            },
          },
          { text: "Cancel", role: "cancel" },
        ],
      });
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

      if (isLemmyError(error, "incorrect_login")) {
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
      <AppHeader>
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
      </AppHeader>
      <IonContent color="light">
        <div className="ion-padding">
          You are logging in to{" "}
          <InAppExternalLink
            href={buildBaseLemmyUrl(url)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IonChip outline>
              <IonAvatar>
                <LoginAvatarImg src={siteIcon} />
              </IonAvatar>
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
            href={VOYAGER_TERMS}
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
