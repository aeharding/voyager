import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { shuffle } from "ionicons/icons";
import { useAppSelector } from "../../store";

export default function RandomCommunity() {
  const trendingCommunities = useAppSelector(
    (state) => state.community.trendingCommunities,
  );
  const communitiesCount = useAppSelector(
    (state) => state.site.response?.site_view.counts.communities,
  );

  // Prevent shift of content
  if (trendingCommunities === undefined) return;

  if (!communitiesCount) return;

  return (
    <IonList inset color="primary">
      <IonItem routerLink="/search/random">
        <IonIcon icon={shuffle} color="primary" slot="start" />
        <IonLabel className="ion-text-nowrap">Random Community</IonLabel>
      </IonItem>
    </IonList>
  );
}
