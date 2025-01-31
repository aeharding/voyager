import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonItem,
  IonList,
  IonNavLink,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext, useState } from "react";

import AppHeader from "#/features/shared/AppHeader";
import { DynamicDismissableModalContext } from "#/features/shared/DynamicDismissableModal";
import Markdown from "#/features/shared/markdown/Markdown";
import { useAppSelector } from "#/store";

import Join from "./Join";

export default function Question() {
  const { site, url } = useAppSelector((state) => state.join);
  const { setCanDismiss } = useContext(DynamicDismissableModalContext);
  const [answer, setAnswer] = useState("");

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Account application</IonTitle>
          <IonButtons slot="end">
            <IonNavLink
              component={answer ? () => <Join answer={answer} /> : undefined}
            >
              <IonButton strong disabled={!answer}>
                Next
              </IonButton>
            </IonNavLink>
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <AppHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Account application</IonTitle>
          </IonToolbar>
        </AppHeader>

        <p className="ion-padding">
          <IonText color="warning">
            <strong>{url} manually reviews account requests.</strong>
          </IonText>{" "}
          Please read and enter your <strong>application answer</strong> below.
        </p>

        <IonList inset className="ion-padding">
          <Markdown
            className="collapse-md-margins"
            id={`site-application-question-${site?.site_view.site.actor_id}`}
          >
            {site?.site_view.local_site.application_question}
          </Markdown>
        </IonList>

        <IonList inset>
          <IonItem>
            <IonTextarea
              labelPlacement="stacked"
              autoGrow
              onIonInput={(e) => {
                setAnswer(e.detail.value || "");
                setCanDismiss(false);
              }}
              value={answer}
            >
              <div slot="label">
                Application Answer <IonText color="danger">(Required)</IonText>
              </div>
            </IonTextarea>
          </IonItem>
        </IonList>
      </IonContent>
    </>
  );
}
