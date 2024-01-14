import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonNavLink,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppSelector } from "../../../../store";
import Markdown from "../../../shared/Markdown";
import Join from "./Join";
import { useContext, useState } from "react";
import { DynamicDismissableModalContext } from "../../../shared/DynamicDismissableModal";

export default function Question() {
  const { site, url } = useAppSelector((state) => state.join);
  const { setCanDismiss } = useContext(DynamicDismissableModalContext);
  const [answer, setAnswer] = useState("");

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Account application</IonTitle>
          <IonButtons slot="end">
            <IonNavLink component={answer ? () => <Join /> : undefined}>
              <IonButton strong disabled={!answer}>
                Next
              </IonButton>
            </IonNavLink>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Account application</IonTitle>
          </IonToolbar>
        </IonHeader>

        <p className="ion-padding">
          <IonText color="warning">
            <strong>{url} manually reviews account requests.</strong>
          </IonText>{" "}
          Please read and enter your <strong>application answer</strong> below.
        </p>

        <IonList inset className="ion-padding">
          <Markdown className="collapse-md-margins">
            {site?.site_view.local_site.application_question}
          </Markdown>
        </IonList>

        <IonList inset>
          <IonItem>
            <IonTextarea
              labelPlacement="stacked"
              placeholder="lemmy in"
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
