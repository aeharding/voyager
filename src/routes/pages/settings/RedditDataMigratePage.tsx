import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import MigrateList from "#/features/migrate/MigrateList";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";

export default function RedditMigratePage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Migrate</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY>
        <MigrateList />
      </AppContent>
    </IonPage>
  );
}
