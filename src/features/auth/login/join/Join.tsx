import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { useAppSelector } from "../../../../store";
import { useEffect, useRef, useState } from "react";
import Joined from "./Joined";
import Captcha from "./Captcha";

export default function Join() {
  const { site, url } = useAppSelector((state) => state.join);

  // eslint-disable-next-line no-undef
  const ref = useRef<HTMLIonListElement>(null);

  // eslint-disable-next-line no-undef
  const emailRef = useRef<HTMLIonInputElement>(null);

  const [nsfw, setNsfw] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      emailRef.current?.setFocus();
    }, 300);
  }, []);

  async function submit() {
    const nav = ref.current?.closest("ion-nav");
    if (!nav) return;

    nav.push(
      () => <Joined />,
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
            <IonButton strong onClick={submit}>
              Submit
            </IonButton>
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
              placeholder="username"
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
              placeholder="username"
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
          <Captcha url={url} />
        )}
      </IonContent>
    </>
  );
}
