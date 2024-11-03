import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import TagsSettings from "#/features/settings/tags/TagsSettings";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";

export default function TagsSettingsPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage className="grey-bg" ref={pageRef}>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Settings" defaultHref="/settings" />
          </IonButtons>

          <IonTitle>User Tags</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY fullscreen>
        <TagsSettings />
      </AppContent>
    </IonPage>
  );
}
