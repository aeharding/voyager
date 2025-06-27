import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { useState } from "react";
import { CommunityView, ListingType } from "threadiverse";

import CommunityFeed from "#/features/feed/CommunityFeed";
import { AbortLoadError, FetchFn } from "#/features/feed/Feed";
import ListingTypeFilter from "#/features/feed/ListingType";
import useFeedSort, {
  useFeedSortParams,
} from "#/features/feed/sort/useFeedSort";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { LIMIT } from "#/services/lemmy";

import { CommunitySort } from "./results/CommunitySort";

export default function CommunitiesExplorePage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const [sort, setSort] = useFeedSort("communities", {
    internal: "CommunitiesExplore",
  });
  const sortParams = useFeedSortParams("communities", sort);
  const [listingType, setListingType] = useState<ListingType>("All");

  const fetchFn: FetchFn<CommunityView> = async (pageData, ...rest) => {
    if (sortParams === undefined) throw new AbortLoadError();

    return client.listCommunities(
      {
        limit: LIMIT,
        type_: listingType,
        ...pageData,
        ...sortParams,
      },
      ...rest,
    );
  };

  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Search"
              defaultHref={buildGeneralBrowseLink("")}
            />
          </IonButtons>

          <IonTitle>Communities</IonTitle>

          <IonButtons slot="end">
            <ListingTypeFilter
              listingType={listingType}
              setListingType={setListingType}
            />
            <CommunitySort sort={sort} setSort={setSort} />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <FeedContent>
        <CommunityFeed fetchFn={fetchFn} />
      </FeedContent>
    </AppPage>
  );
}
