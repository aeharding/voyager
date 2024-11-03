import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import {
  albumsOutline,
  arrowForward,
  chatbubbleOutline,
  personOutline,
  searchOutline,
} from "ionicons/icons";
import { useMemo } from "react";

import useLemmyUrlHandler from "#/features/shared/useLemmyUrlHandler";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";

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
            <IonIcon icon={arrowForward} color="primary" slot="start" />
            <IonLabel>Visit {type}</IonLabel>
          </IonItem>
        )}
        <IonItem routerLink={`/search/posts/${searchURI}`}>
          <IonIcon icon={albumsOutline} color="primary" slot="start" />
          <IonLabel className="ion-text-nowrap">Posts with “{search}”</IonLabel>
        </IonItem>
        <IonItem routerLink={`/search/comments/${searchURI}`}>
          <IonIcon icon={chatbubbleOutline} color="primary" slot="start" />
          <IonLabel className="ion-text-nowrap">
            Comments with “{search}”
          </IonLabel>
        </IonItem>
        <IonItem routerLink={`/search/communities/${searchURI}`}>
          <IonIcon icon={searchOutline} color="primary" slot="start" />
          <IonLabel className="ion-text-nowrap">
            Communities with “{search}”
          </IonLabel>
        </IonItem>
        <IonItem routerLink={buildGeneralBrowseLink(`/u/${sanitizedUser}`)}>
          <IonIcon icon={personOutline} color="primary" slot="start" />
          <IonLabel className="ion-text-nowrap">Go to User “{search}”</IonLabel>
        </IonItem>
      </IonList>
      {autoResolveType && <AutoResolvePostComment url={search} />}
    </>
  );
}
