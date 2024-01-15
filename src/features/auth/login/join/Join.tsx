import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { useContext, useEffect, useRef, useState } from "react";
import Joined from "./Joined";
import Captcha, { CaptchaHandle } from "./Captcha";
import { DynamicDismissableModalContext } from "../../../shared/DynamicDismissableModal";
import useAppToast from "../../../../helpers/useAppToast";
import { loginSuccess } from "../../../../helpers/toastMessages";
import { register } from "../../authSlice";
import { LoginResponse } from "lemmy-js-client";
import { startCase } from "lodash";

interface JoinProps {
  answer?: string;
}

export default function Join({ answer }: JoinProps) {
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();

  const { setCanDismiss, dismiss } = useContext(DynamicDismissableModalContext);
  const { site, url } = useAppSelector((state) => state.join);

  // eslint-disable-next-line no-undef
  const ref = useRef<HTMLIonListElement>(null);

  // eslint-disable-next-line no-undef
  const emailRef = useRef<HTMLIonInputElement>(null);

  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerify, setPasswordVerify] = useState("");
  const [nsfw, setNsfw] = useState(false);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const captchaRef = useRef<CaptchaHandle>(null);

  useEffect(() => {
    setTimeout(() => {
      emailRef.current?.setFocus();
    }, 300);
  }, []);

  async function submit() {
    if (!url) return;

    setLoading(true);

    let response: LoginResponse | true;

    try {
      response = await dispatch(
        register(url, {
          username,
          password,
          password_verify: passwordVerify,
          show_nsfw: nsfw,
          email: email || undefined,
          honeypot: honeypot || undefined,
          answer: answer || undefined,
          ...captchaRef.current?.getResult(),
        }),
      );
    } catch (error) {
      if (!(error instanceof Error)) throw error;

      presentToast({
        message: `Registration error: ${startCase(error.message)}`,
        color: "danger",
        position: "top",
      });

      throw error;
    } finally {
      setLoading(false);
    }

    // Logged in, so bail
    if (response === true) {
      setCanDismiss(true);
      dismiss();

      presentToast(loginSuccess);

      return;
    }

    const { verify_email_sent } = response;

    const nav = ref.current?.closest("ion-nav");
    if (!nav) return;

    nav.push(
      () => <Joined verifyEmailSent={verify_email_sent} />,
      null,
      null,
      async (hasCompleted, requiresTransition, entering) => {
        // Remove signup steps from stack (everything between root and current nav view)
        // (user should not be able to navigate back after signup)

        // TODO open bug for missing ionic type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (entering) nav.removeIndex(1, (nav as any).getLength() - 2);
      },
    );
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Account Details</IonTitle>
          <IonButtons slot="end">
            {loading ? (
              <IonSpinner />
            ) : (
              <IonButton strong onClick={submit}>
                Submit
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Account Details</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList inset ref={ref}>
          <IonItem>
            <IonInput
              type="email"
              labelPlacement="stacked"
              placeholder="email@proton.me"
              autocomplete="email"
              ref={emailRef}
              value={email}
              onIonInput={(e) => setEmail(e.detail.value || "")}
            >
              <div slot="label">
                Email{" "}
                {site?.site_view.local_site.require_email_verification && (
                  <IonText color="danger">(Required)</IonText>
                )}
              </div>
            </IonInput>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonItem>
            <IonInput
              labelPlacement="stacked"
              placeholder="username"
              autocomplete="username"
              value={username}
              onIonInput={(e) => setUsername(e.detail.value || "")}
            >
              <div slot="label">
                Username <IonText color="danger">(Required)</IonText>
              </div>
              <IonText color="medium" slot="start">
                @
              </IonText>
              <IonText color="medium" slot="end">
                @{url}
              </IonText>
            </IonInput>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonItem>
            <IonInput
              type="password"
              labelPlacement="stacked"
              value={password}
              onIonInput={(e) => setPassword(e.detail.value || "")}
              clearOnEdit={false}
            >
              <div slot="label">
                Password <IonText color="danger">(Required)</IonText>
              </div>
            </IonInput>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonItem>
            <IonInput
              type="password"
              labelPlacement="stacked"
              value={passwordVerify}
              onIonInput={(e) => setPasswordVerify(e.detail.value || "")}
              clearOnEdit={false}
            >
              <div slot="label">
                Confirm Password <IonText color="danger">(Required)</IonText>
              </div>
            </IonInput>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonItem>
            <IonToggle
              checked={nsfw}
              onIonChange={(e) => setNsfw(e.detail.checked)}
            >
              Show NSFW
            </IonToggle>
          </IonItem>
        </IonList>

        {site?.site_view.local_site.captcha_enabled && url && (
          <Captcha url={url} ref={captchaRef} />
        )}

        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="ion-hide"
        />
      </IonContent>
    </>
  );
}
