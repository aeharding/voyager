import { memo, useRef } from "react";
import CommunitiesList from "../../../features/community/list/CommunitiesList";
import { useSetActivePage } from "../../../features/auth/AppContext";
import {
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import CommunitiesMoreActions from "../../../features/community/list/InstanceMoreActions";
import FeedContent from "../shared/FeedContent";
import { useParams } from "react-router";
import CommunitiesListRedirectBootstrapper from "../../../features/community/list/CommunitiesListRedirectBootstrapper";

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
        <IonHeader>
          <IonToolbar>
            <IonTitle>Communities</IonTitle>
            <IonButtons slot="end">
              <CommunitiesMoreActions />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <FeedContent>
          <CommunitiesList actor={actor} />
        </FeedContent>
      </IonPage>
    </>
  );
});
