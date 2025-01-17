import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { memo, useEffect, useRef } from "react";
import { useParams } from "react-router";

import { useSetActivePage } from "#/features/auth/AppContext";
import { getCommunity } from "#/features/community/communitySlice";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import Sidebar from "#/features/sidebar/Sidebar";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useAppDispatch, useAppSelector } from "#/store";

interface CommunitySidebarPageProps {
  community: string;
}

export default function CommunitySidebarPage() {
  const { community } = useParams<CommunitySidebarPageProps>();

  return <CommunitySidebarPageContent community={community} />;
}

const CommunitySidebarPageContent = memo(function CommunitySidebarPageContent({
  community,
}: CommunitySidebarPageProps) {
  const pageRef = useRef<HTMLElement>(null);
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();

  const communityView = useAppSelector(
    (state) => state.community.communityByHandle[community.toLowerCase()],
  );
  const mods = useAppSelector(
    (state) => state.community.modsByHandle[community],
  );

  useSetActivePage(pageRef);

  useEffect(() => {
    if (communityView && mods) return;

    dispatch(getCommunity(community));
  }, [community, dispatch, communityView, mods]);

  return (
    <IonPage ref={pageRef}>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref={buildGeneralBrowseLink(`/c/${community}`)}
            />
          </IonButtons>

          <IonTitle>{community}</IonTitle>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        {communityView ? (
          <Sidebar community={communityView} />
        ) : (
          <CenteredSpinner />
        )}
      </IonContent>
    </IonPage>
  );
});
