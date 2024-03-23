import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../../helpers/routes";
import { useCallback } from "react";
import { FetchFn, isFirstPage } from "../../../../features/feed/Feed";
import useClient from "../../../../helpers/useClient";
import { LIMIT } from "../../../../services/lemmy";
import { useParams } from "react-router";
import PostSort from "../../../../features/feed/PostSort";
import { CommunityView, LemmyHttp } from "lemmy-js-client";
import CommunityFeed from "../../../../features/feed/CommunityFeed";
import { isLemmyError } from "../../../../helpers/lemmyErrors";
import useFeedSort from "../../../../features/feed/sort/useFeedSort";
import { compact } from "lodash";
import AppHeader from "../../../../features/shared/AppHeader";

export default function SearchCommunitiesPage() {
  const { search: _encodedSearch } = useParams<{ search: string }>();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const [sort, setSort] = useFeedSort();

  const search = decodeURIComponent(_encodedSearch);

  const fetchFn: FetchFn<CommunityView> = useCallback(
    async (pageData) => {
      if (isFirstPage(pageData) && search.includes("@")) {
        return compact([await findExactCommunity(search, client)]);
      }

      const response = await client.search({
        limit: LIMIT,
        q: search,
        type_: "Communities",
        listing_type: "All",
        ...pageData,
        sort,
      });

      return response.communities;
    },
    [client, search, sort],
  );

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

          <IonTitle>“{search}”</IonTitle>

          <IonButtons slot="end">
            <PostSort sort={sort} setSort={setSort} />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <CommunityFeed fetchFn={fetchFn} />
      </IonContent>
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
    if (isLemmyError(error, "couldnt_find_community")) return;

    throw error;
  }
}
