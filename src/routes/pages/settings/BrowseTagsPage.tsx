import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { startCase } from "es-toolkit";
import { useRef } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import BrowseTags from "#/features/settings/tags/browse/BrowseTags";
import AppHeader from "#/features/shared/AppHeader";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import FeedContent from "#/routes/pages/shared/FeedContent";

export default function BrowseTagsPage() {
  const router = useOptimizedIonRouter();
  const searchParams = new URLSearchParams(router.getRouteInfo()?.search);
  const filter = searchParams.get("filter") as "all" | "tagged";

  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage className="grey-bg" ref={pageRef}>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings/tags" />
          </IonButtons>

          <IonTitle>View {startCase(filter)}</IonTitle>
        </IonToolbar>
      </AppHeader>
      <FeedContent>
        <BrowseTags filter={filter} />
      </FeedContent>
    </IonPage>
  );
}
