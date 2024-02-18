import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import { useRef } from "react";
import { useSetActivePage } from "../../../features/auth/AppContext";
import MigrateSubsList from "../../../features/migrate/MigrateSubsList";
import { useParams } from "react-router";

export default function RedditMigrateSubsListPage() {
  const { link } = useParams<{ link: string }>();
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/settings/reddit-migrate"
              text="Migrate"
            />
          </IonButtons>

          <IonTitle>Subreddits</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <MigrateSubsList link={link} />
      </AppContent>
    </IonPage>
  );
}
