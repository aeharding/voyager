import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { useRef } from "react";
import AppHeader from "../../../features/shared/AppHeader";
import TagsSettings from "../../../features/settings/tags/TagsSettings";

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
