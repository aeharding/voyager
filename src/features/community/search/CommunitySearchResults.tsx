import { IonLabel, IonList } from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { MaxWidthContainer } from "../../shared/AppContent";
import { InsetIonItem } from "../../settings/shared/formatting";

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
        <InsetIonItem
          routerLink={buildGeneralBrowseLink(
            `/c/${community}/search/posts/${query}`,
          )}
        >
          <IonLabel>
            Search posts on c/{community} for “{query}”
          </IonLabel>
        </InsetIonItem>
        <InsetIonItem
          routerLink={buildGeneralBrowseLink(
            `/c/${community}/search/comments/${query}`,
          )}
        >
          <IonLabel>
            Search comments on c/{community} for “{query}”
          </IonLabel>
        </InsetIonItem>
      </IonList>
    </MaxWidthContainer>
  );
}
