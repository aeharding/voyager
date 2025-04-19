import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import AppHeader from "#/features/shared/AppHeader";
import Sidebar from "#/features/sidebar/Sidebar";
import { AppPage } from "#/helpers/AppPage";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useAppSelector } from "#/store";

export default function InstanceSidebarPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  return (
    <AppPage>
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
    </AppPage>
  );
}
