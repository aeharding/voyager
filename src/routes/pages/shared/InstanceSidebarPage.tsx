import { IonButtons, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import AppBackButton from "../../../features/shared/AppBackButton";
import { useRef } from "react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { TitleSearchProvider } from "../../../features/community/titleSearch/TitleSearchProvider";
import FeedContextProvider from "../../../features/feed/FeedContext";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { useAppSelector } from "../../../store";
import AppContent from "../../../features/shared/AppContent";
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
    <FeedContextProvider>
      <TitleSearchProvider>
        <IonPage ref={pageRef}>
          <AppHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <AppBackButton
                  defaultText="Communities"
                  defaultHref={buildGeneralBrowseLink("/")}
                />
              </IonButtons>
              <IonTitle>{connectedInstance}</IonTitle>
            </IonToolbar>
          </AppHeader>
          <AppContent scrollY>
            <Sidebar />
          </AppContent>
        </IonPage>
      </TitleSearchProvider>
    </FeedContextProvider>
  );
}
