import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { useRef } from "react";
import AppHeader from "../../../features/shared/AppHeader";
import BrowseTags from "../../../features/settings/tags/browse/BrowseTags";
import FeedContent from "../shared/FeedContent";
import { startCase } from "lodash";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";

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
