import { IonIcon, IonList } from "@ionic/react";
import { InsetIonItem, SettingLabel } from "../user/Profile";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import {
  albumsOutline,
  chatbubbleOutline,
  personOutline,
  searchOutline,
} from "ionicons/icons";

interface SearchOptionsProps {
  search: string;
}

export default function SearchOptions({ search }: SearchOptionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <IonList inset color="primary">
      <InsetIonItem routerLink={`/search/posts/${search}`}>
        <IonIcon icon={albumsOutline} color="primary" />
        <SettingLabel>Posts with “{search}”</SettingLabel>
      </InsetIonItem>
      <InsetIonItem routerLink={`/search/comments/${search}`}>
        <IonIcon icon={chatbubbleOutline} color="primary" />
        <SettingLabel>Comments with “{search}”</SettingLabel>
      </InsetIonItem>
      <InsetIonItem routerLink={`/search/communities/${search}`}>
        <IonIcon icon={searchOutline} color="primary" />
        <SettingLabel>Communities with “{search}”</SettingLabel>
      </InsetIonItem>
      <InsetIonItem routerLink={buildGeneralBrowseLink(`/u/${search}`)}>
        <IonIcon icon={personOutline} color="primary" />
        <SettingLabel>Go to User “{search}”</SettingLabel>
      </InsetIonItem>
    </IonList>
  );
}
