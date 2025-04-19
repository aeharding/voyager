import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { startCase } from "es-toolkit";

import BrowseTags from "#/features/settings/tags/browse/BrowseTags";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import FeedContent from "#/routes/pages/shared/FeedContent";

export default function BrowseTagsPage() {
  const router = useOptimizedIonRouter();
  const searchParams = new URLSearchParams(router.getRouteInfo()?.search);
  const filter = searchParams.get("filter") as "all" | "tagged";

  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings/tags" />
          </IonButtons>

          <IonTitle>View {startCase(filter)}</IonTitle>
        </IonToolbar>
      </AppHeader>
      <FeedContent color="light-bg">
        <BrowseTags filter={filter} />
      </FeedContent>
    </AppPage>
  );
}
