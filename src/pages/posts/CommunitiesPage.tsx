import { useRef } from "react";
import CommunitiesList from "../../features/community/list/CommunitiesList";
import { useSetActivePage } from "../../features/auth/AppContext";
import { IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import AppContent from "../../features/shared/AppContent";

export default function CommunitiesPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Communities</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <CommunitiesList />
      </AppContent>
    </IonPage>
  );
}
