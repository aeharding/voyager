import { useRef } from "react";
import CommunitiesList from "../../features/community/list/CommunitiesList";
import { useSetActivePage } from "../../features/auth/AppContext";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import CommunitiesMoreActions from "../../features/community/list/InstanceMoreActions";
import FeedContent from "../shared/FeedContent";

export default function CommunitiesPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Communities</IonTitle>
          <IonButtons slot="end">
            <CommunitiesMoreActions />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent scrollY={false}>
        <CommunitiesList />
      </IonContent>
    </IonPage>
  );
}
