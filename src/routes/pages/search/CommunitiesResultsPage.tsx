import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { compact } from "es-toolkit";
import { useState } from "react";
import { CommunityView, ListingType, ThreadiverseClient } from "threadiverse";

import CommunityFeed from "#/features/feed/CommunityFeed";
import { AbortLoadError, FetchFn } from "#/features/feed/Feed";
import ListingTypeFilter from "#/features/feed/ListingType";
import { SearchSort } from "#/features/feed/sort/SearchSort";
import useFeedSort, {
  useFeedSortParams,
} from "#/features/feed/sort/useFeedSort";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";
import { isLemmyError } from "#/helpers/lemmyErrors";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { LIMIT } from "#/services/lemmy";

interface CommunitiesResultsPageProps {
  search: string;
}

export default function CommunitiesResultsPage({
  search,
}: CommunitiesResultsPageProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const [sort, setSort] = useFeedSort(
    "search",
    { internal: search ? "CommunitiesSearch" : "CommunitiesExplore" },
    {
      lemmyv0: "TopAll",
      lemmyv1: "TopAll",
      piefed: "Active",
    },
  );
  const sortParams = useFeedSortParams("search", sort);
  const [listingType, setListingType] = useState<ListingType>("All");

  const fetchFn: FetchFn<CommunityView> = async (page_cursor, ...rest) => {
    if (sortParams === undefined) throw new AbortLoadError();

    if (!page_cursor && search?.includes("@")) {
      const exactCommunity = await findExactCommunity(search, client);
      return { data: compact([exactCommunity]) };
    }

    const response = await client.search(
      {
        limit: LIMIT,
        q: search,
        type_: "Communities",
        listing_type: listingType,
        page_cursor,
        ...sortParams,
      },
      ...rest,
    );

    return {
      ...response,
      data: response.data as CommunityView[],
    };
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

          <IonTitle>{search ? <>“{search}”</> : "Communities"}</IonTitle>

          <IonButtons slot="end">
            <ListingTypeFilter
              listingType={listingType}
              setListingType={setListingType}
            />
            <SearchSort sort={sort} setSort={setSort} />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <FeedContent>
        <CommunityFeed fetchFn={fetchFn} />
      </FeedContent>
    </AppPage>
  );
}

async function findExactCommunity(
  name: string,
  client: ThreadiverseClient,
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
