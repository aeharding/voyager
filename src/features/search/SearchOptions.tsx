import { IonIcon, IonList } from "@ionic/react";
import { InsetIonItem, SettingLabel } from "../user/Profile";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import {
  albumsOutline,
  arrowForward,
  chatbubbleOutline,
  personOutline,
  searchOutline,
} from "ionicons/icons";
import useLemmyUrlHandler from "../shared/useLemmyUrlHandler";
import { useMemo } from "react";

interface SearchOptionsProps {
  search: string;
}

export default function SearchOptions({ search }: SearchOptionsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { determineObjectTypeFromUrl, redirectToLemmyObjectIfNeeded } =
    useLemmyUrlHandler();

  const searchURI = encodeURIComponent(search);

  const sanitizedUser = search.replace(/|\/|#|\?|\\/g, "").replace(/^@/, "");

  const type = useMemo(
    () => determineObjectTypeFromUrl(search),
    [determineObjectTypeFromUrl, search],
  );

  return (
    <IonList inset color="primary">
      {type && (
        <InsetIonItem
          onClick={(e) => redirectToLemmyObjectIfNeeded(search, e)}
          detail
          button
        >
          <IonIcon icon={arrowForward} color="primary" />
          <SettingLabel>Visit {type}</SettingLabel>
        </InsetIonItem>
      )}
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
      <InsetIonItem routerLink={buildGeneralBrowseLink(`/u/${sanitizedUser}`)}>
        <IonIcon icon={personOutline} color="primary" />
        <SettingLabel>Go to User “{search}”</SettingLabel>
      </InsetIonItem>
    </IonList>
  );
}
