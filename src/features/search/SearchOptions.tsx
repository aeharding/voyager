import { IonIcon, IonItem, IonList } from "@ionic/react";
import { SettingLabel } from "../user/Profile";
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
import AutoResolvePostComment from "./AutoResolvePostComment";

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

  const autoResolveType = type === "post" || type === "comment";

  return (
    <>
      <IonList inset color="primary">
        {type && !autoResolveType && (
          <IonItem
            onClick={(e) => redirectToLemmyObjectIfNeeded(search, e)}
            detail
            button
          >
            <IonIcon icon={arrowForward} color="primary" />
            <SettingLabel>Visit {type}</SettingLabel>
          </IonItem>
        )}
        <IonItem routerLink={`/search/posts/${searchURI}`}>
          <IonIcon icon={albumsOutline} color="primary" />
          <SettingLabel className="ion-text-nowrap">
            Posts with “{search}”
          </SettingLabel>
        </IonItem>
        <IonItem routerLink={`/search/comments/${searchURI}`}>
          <IonIcon icon={chatbubbleOutline} color="primary" />
          <SettingLabel className="ion-text-nowrap">
            Comments with “{search}”
          </SettingLabel>
        </IonItem>
        <IonItem routerLink={`/search/communities/${searchURI}`}>
          <IonIcon icon={searchOutline} color="primary" />
          <SettingLabel className="ion-text-nowrap">
            Communities with “{search}”
          </SettingLabel>
        </IonItem>
        <IonItem routerLink={buildGeneralBrowseLink(`/u/${sanitizedUser}`)}>
          <IonIcon icon={personOutline} color="primary" />
          <SettingLabel className="ion-text-nowrap">
            Go to User “{search}”
          </SettingLabel>
        </IonItem>
      </IonList>
      {autoResolveType && <AutoResolvePostComment url={search} />}
    </>
  );
}
