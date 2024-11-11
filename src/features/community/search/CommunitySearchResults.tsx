import { IonItem, IonLabel, IonList } from "@ionic/react";

import { MaxWidthContainer } from "#/features/shared/AppContent";
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
            `/c/${community}/search/posts/${query}`,
          )}
        >
          <IonLabel>
            Search posts on c/{community} for “{query}”
          </IonLabel>
        </IonItem>
        <IonItem
          routerLink={buildGeneralBrowseLink(
            `/c/${community}/search/comments/${query}`,
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
