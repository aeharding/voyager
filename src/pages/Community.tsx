import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Posts from "../components/Posts";
import { useParams } from "react-router";
import AppBackButton from "../components/AppBackButton";
import PostSort from "../components/PostSort";
import MoreActions from "../components/community/MoreActions";
import { useAppDispatch, useAppSelector } from "../store";
import { useEffect } from "react";
import { getCommunity } from "../components/community/communitySlice";
import { useBuildGeneralBrowseLink } from "../helpers/routes";

export default function Community() {
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
