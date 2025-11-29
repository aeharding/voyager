import { IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { memo } from "react";
import { useParams } from "react-router";

import CommunitiesList from "#/features/community/list/CommunitiesList";
import CommunitiesListRedirectBootstrapper from "#/features/community/list/CommunitiesListRedirectBootstrapper";
import { ConfirmLeaveFeedPrompt } from "#/features/community/list/ConfirmLeaveFeedPrompt";
import CommunitiesMoreActions from "#/features/community/list/InstanceMoreActions";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";
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
  return (
    <>
      <ConfirmLeaveFeedPrompt />
      <CommunitiesListRedirectBootstrapper />
      <AppPage>
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
      </AppPage>
    </>
  );
});
