import { IonHeader, IonPage, IonSearchbar, IonToolbar } from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import { createRef, useState } from "react";
import { css } from "@emotion/react";
import TrendingCommunities from "../../features/search/TrendingCommunities";
import SearchOptions from "../../features/search/SearchOptions";

// eslint-disable-next-line no-undef -- I can't work out where to import this type from
const searchBarRef = createRef<HTMLIonSearchbarElement>();

/**
 * Focuses on the search bar input element.
 */
export const focusSearchBar = () => searchBarRef.current?.setFocus();

export default function SearchPage() {
  const [search, setSearch] = useState("");

  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonSearchbar
            ref={searchBarRef}
            placeholder="Search posts, communities, users"
            showCancelButton={search ? "always" : "never"}
            showClearButton="never"
            css={css`
              padding-top: 0 !important;
              padding-bottom: 0 !important;
            `}
            value={search}
            onIonInput={(e) => setSearch(e.detail.value ?? "")}
          />
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY={!search}>
        {!search ? <TrendingCommunities /> : <SearchOptions search={search} />}
      </AppContent>
    </IonPage>
  );
}
