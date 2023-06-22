import { IonHeader, IonPage, IonSearchbar, IonToolbar } from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import { useState } from "react";
import { css } from "@emotion/react";
import TrendingCommunities from "../../features/search/TrendingCommunities";
import SearchOptions from "../../features/search/SearchOptions";

export default function SearchPage() {
  const [search, setSearch] = useState("");

  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonSearchbar
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
