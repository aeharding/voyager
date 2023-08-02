import {
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppBackButton from "../../features/shared/AppBackButton";
import { useRef } from "react";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { TitleSearchProvider } from "../../features/community/titleSearch/TitleSearchProvider";
import FeedContextProvider from "../../features/feed/FeedContext";
import { useSetActivePage } from "../../features/auth/AppContext";
import { useAppSelector } from "../../store";
import AppContent from "../../features/shared/AppContent";
import Sidebar from "../../features/sidebar/Sidebar";

export default function InstanceSidebarPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const pageRef = useRef<HTMLElement>(null);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );

  useSetActivePage(pageRef);

  return (
    <FeedContextProvider>
      <TitleSearchProvider>
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <AppBackButton
                  defaultText="Communities"
                  defaultHref={buildGeneralBrowseLink("/")}
                />
              </IonButtons>
              <IonTitle>{connectedInstance}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <AppContent scrollY>
            <Sidebar />
          </AppContent>
        </IonPage>
      </TitleSearchProvider>
    </FeedContextProvider>
  );
}
