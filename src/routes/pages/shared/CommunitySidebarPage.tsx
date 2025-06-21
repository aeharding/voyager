import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { memo, useEffect } from "react";
import { useParams } from "react-router";

import { getCommunity } from "#/features/community/communitySlice";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import Sidebar from "#/features/sidebar/Sidebar";
import { AppPage } from "#/helpers/AppPage";
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
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();

  const communityView = useAppSelector(
    (state) => state.community.communityByHandle[community.toLowerCase()],
  );
  const mods = useAppSelector(
    (state) => state.community.modsByHandle[community],
  );

  useEffect(() => {
    if (communityView && mods) return;

    dispatch(getCommunity(community));
  }, [community, dispatch, communityView, mods]);

  return (
    <AppPage>
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
    </AppPage>
  );
});
