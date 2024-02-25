import { IonPage, IonSearchbar, IonToolbar } from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import { createRef, useState } from "react";
import TrendingCommunities from "../../../features/search/TrendingCommunities";
import SearchOptions from "../../../features/search/SearchOptions";
import useLemmyUrlHandler from "../../../features/shared/useLemmyUrlHandler";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";
import { css } from "@linaria/core";
import AppHeader from "../../../features/shared/AppHeader";

const searchBarRef = createRef<HTMLIonSearchbarElement>();

/**
 * Focuses on the search bar input element.
 */
export const focusSearchBar = () => searchBarRef.current?.setFocus();

export default function SearchPage() {
  const [search, setSearch] = useState("");
  const router = useOptimizedIonRouter();
  const { redirectToLemmyObjectIfNeeded } = useLemmyUrlHandler();

  return (
    <IonPage className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              if (!search.trim()) return;

              const potentialUrl = search.trim();

              if (await redirectToLemmyObjectIfNeeded(potentialUrl)) return;

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
              className={css`
                padding-top: 0 !important;
                padding-bottom: 0 !important;
              `}
              value={search}
              onIonInput={(e) => setSearch(e.detail.value ?? "")}
              enterkeyhint="search"
            />
          </form>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY={!search}>
        {!search ? <TrendingCommunities /> : <SearchOptions search={search} />}
      </AppContent>
    </IonPage>
  );
}
