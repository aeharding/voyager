import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Posts from "../features/post/inFeed/Posts";
import { useParams } from "react-router";
import AppBackButton from "../features/shared/AppBackButton";
import PostSort from "../features/post/inFeed/PostSort";
import MoreActions from "../features/community/MoreActions";
import { useAppDispatch, useAppSelector } from "../store";
import { useEffect } from "react";
import { getCommunity } from "../features/community/communitySlice";
import { useBuildGeneralBrowseLink } from "../helpers/routes";

export default function CommunityPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const { community } = useParams<{
    community: string;
  }>();

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle
  );

  useEffect(() => {
    if (communityByHandle[community]) return;

    dispatch(getCommunity(community));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <AppBackButton
              defaultText="Communities"
              defaultHref={buildGeneralBrowseLink("")}
            />
          </IonButtons>

          <IonTitle>{community}</IonTitle>

          <IonButtons slot="end">
            <PostSort />
            <MoreActions community={community} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Posts communityName={community} />
      </IonContent>
    </IonPage>
  );
}
