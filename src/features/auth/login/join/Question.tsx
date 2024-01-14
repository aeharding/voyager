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
import { useContext } from "react";
import { DynamicDismissableModalContext } from "../../../shared/DynamicDismissableModal";

export default function Question() {
  const { site } = useAppSelector((state) => state.join);
  const { setCanDismiss } = useContext(DynamicDismissableModalContext);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Account application</IonTitle>
          <IonButtons slot="end">
            <IonNavLink component={() => <Join />}>
              <IonButton strong>Next</IonButton>
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
            <strong>This server manually reviews account requests.</strong>
          </IonText>{" "}
          Please read and enter your <strong>application answer</strong> below.
        </p>

        <IonList inset className="ion-padding">
          <Markdown>{site?.site_view.local_site.application_question}</Markdown>
        </IonList>

        <IonList inset>
          <IonItem>
            <IonTextarea
              labelPlacement="stacked"
              placeholder="lemmy in"
              autoGrow
              onIonInput={() => setCanDismiss(false)}
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
