import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { CommunityView, ListingType } from "lemmy-js-client";
import { useState } from "react";

import CommunityFeed from "#/features/feed/CommunityFeed";
import { FetchFn } from "#/features/feed/Feed";
import ListingTypeFilter from "#/features/feed/ListingType";
import useFeedSort, {
  useFeedSortParams,
} from "#/features/feed/sort/useFeedSort";
import AppHeader from "#/features/shared/AppHeader";
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
    "Subscribers",
  );
  const sortParams = useFeedSortParams("communities", sort);
  const [listingType, setListingType] = useState<ListingType>("All");

  const fetchFn: FetchFn<CommunityView> = async (pageData, ...rest) => {
    const response = await client.listCommunities(
      {
        limit: LIMIT,
        type_: listingType,
        ...pageData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Fix with lemmy-js-client v1
        ...(sortParams as any),
      },
      ...rest,
    );

    // TODO Remove `as` once upgraded to lemmy-js-client v1
    if ("results" in response) return response.results as CommunityView[];

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
