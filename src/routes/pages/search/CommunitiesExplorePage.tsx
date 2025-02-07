import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { compact } from "es-toolkit";
import { CommunityView, LemmyHttp, ListingType } from "lemmy-js-client";
import { useState } from "react";

import CommunityFeed from "#/features/feed/CommunityFeed";
import { FetchFn, isFirstPage } from "#/features/feed/Feed";
import ListingTypeFilter from "#/features/feed/ListingType";
import { SearchSort } from "#/features/feed/sort/SearchSort";
import useFeedSort, {
  useFeedSortParams,
} from "#/features/feed/sort/useFeedSort";
import AppHeader from "#/features/shared/AppHeader";
import { isLemmyError } from "#/helpers/lemmyErrors";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { LIMIT } from "#/services/lemmy";

import { CommunitySort } from "./results/CommunitySort";

export default function CommunitiesExplorePage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const [sort, setSort] = useFeedSort(
    "communities",
    { internal: "CommunitiesExplore" },
    "TopAll",
  );
  const sortParams = useFeedSortParams("communities", sort);
  const [listingType, setListingType] = useState<ListingType>("All");

  const fetchFn: FetchFn<CommunityView> = async (pageData, ...rest) => {
    const response = await client.listCommunities(
      {
        limit: LIMIT,
        type_: listingType,
        ...pageData,
        ...sortParams,
      },
      ...rest,
    );

    if ("results" in response) return response.results;

    return response.communities;
  };

  return (
    <IonPage>
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
    </IonPage>
  );
}
