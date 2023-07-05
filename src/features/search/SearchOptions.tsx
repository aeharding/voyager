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

  const searchURI = encodeURIComponent(search);

  return (
    <IonList inset color="primary">
      <InsetIonItem routerLink={`/search/posts/${searchURI}`}>
        <IonIcon icon={albumsOutline} color="primary" />
        <SettingLabel>Posts with “{search}”</SettingLabel>
      </InsetIonItem>
      <InsetIonItem routerLink={`/search/comments/${searchURI}`}>
        <IonIcon icon={chatbubbleOutline} color="primary" />
        <SettingLabel>Comments with “{search}”</SettingLabel>
      </InsetIonItem>
      <InsetIonItem routerLink={`/search/communities/${searchURI}`}>
        <IonIcon icon={searchOutline} color="primary" />
        <SettingLabel>Communities with “{search}”</SettingLabel>
      </InsetIonItem>
      <InsetIonItem routerLink={buildGeneralBrowseLink(`/u/${searchURI}`)}>
        <IonIcon icon={personOutline} color="primary" />
        <SettingLabel>Go to User “{searchURI}”</SettingLabel>
      </InsetIonItem>
    </IonList>
  );
}
