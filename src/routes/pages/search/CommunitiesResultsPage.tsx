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
import PostSort from "#/features/feed/PostSort";
import useFeedSort from "#/features/feed/sort/useFeedSort";
import AppHeader from "#/features/shared/AppHeader";
import { isLemmyError } from "#/helpers/lemmyErrors";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { LIMIT } from "#/services/lemmy";

interface CommunitiesResultsPageProps {
  search?: string;
}

export default function CommunitiesResultsPage({
  search,
}: CommunitiesResultsPageProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const [sort, setSort] = useFeedSort(
    "posts",
    { internal: search ? "CommunitiesSearch" : "CommunitiesExplore" },
    "TopAll",
  );
  const [listingType, setListingType] = useState<ListingType>("All");

  const fetchFn: FetchFn<CommunityView> = async (pageData, ...rest) => {
    if (isFirstPage(pageData) && search?.includes("@")) {
      return compact([await findExactCommunity(search, client)]);
    }

    const response = await (search
      ? client.search(
          {
            limit: LIMIT,
            q: search,
            type_: "Communities",
            listing_type: listingType,
            ...pageData,
            sort,
          },
          ...rest,
        )
      : client.listCommunities(
          {
            limit: LIMIT,
            type_: listingType,
            ...pageData,
            sort,
          },
          ...rest,
        ));

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

          <IonTitle>{search ? <>“{search}”</> : "Communities"}</IonTitle>

          <IonButtons slot="end">
            <ListingTypeFilter
              listingType={listingType}
              setListingType={setListingType}
            />
            <PostSort sort={sort} setSort={setSort} />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <FeedContent>
        <CommunityFeed fetchFn={fetchFn} />
      </FeedContent>
    </IonPage>
  );
}

async function findExactCommunity(
  name: string,
  client: LemmyHttp,
): Promise<CommunityView | undefined> {
  const sanitizedName = name.startsWith("!") ? name.slice(1) : name;

  try {
    return (await client.getCommunity({ name: sanitizedName })).community_view;
  } catch (error) {
    if (
      isLemmyError(error, "couldnt_find_community" as never) || // TODO lemmy 0.19 and less support
      isLemmyError(error, "not_found")
    )
      return;

    throw error;
  }
}
