import { IonItem, IonLabel, IonList } from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { MaxWidthContainer } from "../../shared/AppContent";

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
            Search posts on c/{community} for &quot;{query}&quot;
          </IonLabel>
        </IonItem>
        <IonItem
          routerLink={buildGeneralBrowseLink(
            `/c/${community}/search/comments/${query}`,
          )}
        >
          <IonLabel>
            Search comments on c/{community} for &quot;{query}&quot;
          </IonLabel>
        </IonItem>
      </IonList>
    </MaxWidthContainer>
  );
}
