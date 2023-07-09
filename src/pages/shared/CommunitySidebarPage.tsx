import {
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useParams } from "react-router";
import AppBackButton from "../../features/shared/AppBackButton";
import PostSort from "../../features/feed/PostSort";
import { useAppDispatch, useAppSelector } from "../../store";
import { useEffect } from "react";
import { getCommunity } from "../../features/community/communitySlice";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { NewPostContextProvider } from "../../features/post/new/NewPostModal";
import { CenteredSpinner } from "../../features/post/detail/PostDetail";
import Sidebar from "../../features/community/sidebar/Sidebar";
import AppContent from "../../features/shared/AppContent";

export default function CommunitySidebarPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const { community } = useParams<{
    community: string;
  }>();

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle
  );

  const communityView = communityByHandle[community];

  useEffect(() => {
    if (communityView) return;

    dispatch(getCommunity(community));
  }, [community, dispatch, communityView]);

  return (
    <NewPostContextProvider community={community}>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <AppBackButton
                defaultText={community}
                defaultHref={buildGeneralBrowseLink(`/c/${community}`)}
              />
            </IonButtons>

            <IonTitle>{community}</IonTitle>

            <IonButtons slot="end">
              <PostSort />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <AppContent scrollY>
          {communityView ? (
            <Sidebar community={communityView} />
          ) : (
            <CenteredSpinner />
          )}
        </AppContent>
      </IonPage>
    </NewPostContextProvider>
  );
}
