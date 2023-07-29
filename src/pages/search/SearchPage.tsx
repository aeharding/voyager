import {
  IonHeader,
  IonPage,
  IonSearchbar,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
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
  const router = useIonRouter();

  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              if (!search.trim()) return;

              const el = await searchBarRef.current?.getInputElement();
              el?.blur();
              router.push(`/search/posts/${encodeURIComponent(search)}`);
            }}
          >
            <IonSearchbar
              ref={searchBarRef}
              placeholder="Search posts, communities, users"
              showCancelButton={search ? "always" : "focus"}
              showClearButton={search ? "always" : "never"}
              css={css`
                padding-top: 0 !important;
                padding-bottom: 0 !important;
              `}
              value={search}
              onIonInput={(e) => setSearch(e.detail.value ?? "")}
              enterkeyhint="search"
            />
          </form>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY={!search}>
        {!search ? <TrendingCommunities /> : <SearchOptions search={search} />}
      </AppContent>
    </IonPage>
  );
}
