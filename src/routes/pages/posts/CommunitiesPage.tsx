import { IonButtons, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { memo, useRef } from "react";
import { useParams } from "react-router";

import { useSetActivePage } from "#/features/auth/AppContext";
import CommunitiesList from "#/features/community/list/CommunitiesList";
import CommunitiesListRedirectBootstrapper from "#/features/community/list/CommunitiesListRedirectBootstrapper";
import CommunitiesMoreActions from "#/features/community/list/InstanceMoreActions";
import AppHeader from "#/features/shared/AppHeader";
import FeedContent from "#/routes/pages/shared/FeedContent";

interface CommunitiesPageParams {
  actor: string;
}

export default function CommunitiesPage() {
  const { actor } = useParams<CommunitiesPageParams>();

  return <CommunitiesPageContent actor={actor} />;
}

const CommunitiesPageContent = memo(function CommunitiesPageContent({
  actor,
}: CommunitiesPageParams) {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <>
      <CommunitiesListRedirectBootstrapper />
      <IonPage ref={pageRef}>
        <AppHeader>
          <IonToolbar>
            <IonTitle>Communities</IonTitle>
            <IonButtons slot="end">
              <CommunitiesMoreActions />
            </IonButtons>
          </IonToolbar>
        </AppHeader>
        <FeedContent>
          <CommunitiesList actor={actor} />
        </FeedContent>
      </IonPage>
    </>
  );
});
