import { IonItem, IonLabel, IonList } from "@ionic/react";

import { MaxWidthContainer } from "#/features/shared/AppContent";
import {
  buildSearchCommentsLink,
  buildSearchPostsLink,
} from "#/helpers/appLinkBuilder";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";

interface CommunitySearchResultsProps {
  community: string;
  query: string;
}

export default function CommunitySearchResults({
  community,
  query,
}: CommunitySearchResultsProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <MaxWidthContainer>
      <IonList inset>
        <IonItem
          routerLink={buildGeneralBrowseLink(
            `/c/${community}${buildSearchPostsLink(query)}`,
          )}
        >
          <IonLabel>
            Search posts on c/{community} for “{query}”
          </IonLabel>
        </IonItem>
        <IonItem
          routerLink={buildGeneralBrowseLink(
            `/c/${community}${buildSearchCommentsLink(query)}`,
          )}
        >
          <IonLabel>
            Search comments on c/{community} for “{query}”
          </IonLabel>
        </IonItem>
      </IonList>
    </MaxWidthContainer>
  );
}
