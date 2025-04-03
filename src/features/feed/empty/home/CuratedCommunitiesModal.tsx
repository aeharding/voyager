import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";

import AppHeader from "#/features/shared/AppHeader";
import { isIosTheme } from "#/helpers/device";

interface CuratedCommunitiesModalProps {
  onDismiss: (data?: string, role?: string) => void;
}

export default function CuratedCommunitiesModal({
  onDismiss,
}: CuratedCommunitiesModalProps) {
  return (
    <IonPage>
      <AppHeader>
        <IonToolbar>
          {isIosTheme() ? (
            <IonButtons slot="primary">
              <IonButton strong onClick={() => onDismiss()}>
                Done
              </IonButton>
            </IonButtons>
          ) : (
            <IonButtons slot="start">
              <IonButton onClick={() => onDismiss()}>
                <IonIcon icon={arrowBackSharp} slot="icon-only" />
              </IonButton>
            </IonButtons>
          )}
          <IonTitle>Starter Packs</IonTitle>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>
              News
              <p>Politics, news, and current events</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              Gaming
              <p>Video games, gaming news, and gaming culture</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              Science
              <p>Science, technology, and science news</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              Sports
              <p>Sports news, scores, and highlights</p>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}
