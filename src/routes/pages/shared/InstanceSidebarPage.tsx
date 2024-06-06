import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef } from "react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { useAppSelector } from "../../../store";
import Sidebar from "../../../features/sidebar/Sidebar";
import AppHeader from "../../../features/shared/AppHeader";

export default function InstanceSidebarPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const pageRef = useRef<HTMLElement>(null);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef}>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={buildGeneralBrowseLink("/")} />
          </IonButtons>
          <IonTitle>{connectedInstance}</IonTitle>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <Sidebar />
      </IonContent>
    </IonPage>
  );
}
