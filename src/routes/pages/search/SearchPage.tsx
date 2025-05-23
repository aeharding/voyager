import { IonSearchbar, IonToolbar } from "@ionic/react";
import { createRef, useState } from "react";

import EmptySearch from "#/features/search/EmptySearch";
import SearchOptions from "#/features/search/SearchOptions";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import useLemmyUrlHandler from "#/features/shared/useLemmyUrlHandler";
import { buildSearchPostsLink } from "#/helpers/appLinkBuilder";
import { AppPage } from "#/helpers/AppPage";
import { findCurrentPage } from "#/helpers/ionic";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

import styles from "./SearchPage.module.css";

/**
 * Focuses on the search bar input element.
 */
export const focusSearchBar = () =>
  findCurrentPage()
    ?.closest(".ion-page")
    ?.querySelector<HTMLIonSearchbarElement>(`.${styles.searchbar}`)
    ?.setFocus();

export default function SearchPage() {
  const [search, setSearch] = useState("");
  const router = useOptimizedIonRouter();
  const { redirectToLemmyObjectIfNeeded } = useLemmyUrlHandler();
  const searchBarRef = createRef<HTMLIonSearchbarElement>();

  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              if (!search.trim()) return;

              const potentialUrl = search.trim();

              const redirectResult =
                await redirectToLemmyObjectIfNeeded(potentialUrl);

              if (redirectResult === "success") return;

              const el = await searchBarRef.current?.getInputElement();
              el?.blur();
              router.push(buildSearchPostsLink(search));
            }}
          >
            <IonSearchbar
              ref={searchBarRef}
              placeholder="Search posts, communities, users"
              autocapitalize="on"
              showCancelButton={search ? "always" : "focus"}
              showClearButton={search ? "always" : "never"}
              className={styles.searchbar}
              value={search}
              onIonInput={(e) => setSearch(e.detail.value ?? "")}
              enterkeyhint="search"
            />
          </form>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY color="light-bg">
        {!search ? <EmptySearch /> : <SearchOptions search={search} />}
      </AppContent>
    </AppPage>
  );
}
