import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { useCallback, useContext } from "react";
import { FetchFn } from "../../../features/feed/Feed";
import useClient from "../../../helpers/useClient";
import { LIMIT } from "../../../services/lemmy";
import { useParams } from "react-router";
import PostSort from "../../../features/feed/postSort/PostSort";
import { useAppSelector } from "../../../store";
import { CommunityView, LemmyHttp } from "lemmy-js-client";
import CommunityFeed from "../../../features/feed/CommunityFeed";
import { jwtSelector } from "../../../features/auth/authSlice";
import { notEmpty } from "../../../helpers/array";
import {
  PostSortContext,
  PostSortContextProvider,
} from "../../../features/feed/postSort/PostSortProvider";

export default function SearchCommunitiesPage() {
  return (
    <PostSortContextProvider>
      <SearchCommunitiesPageWithSort />
    </PostSortContextProvider>
  );
}

function SearchCommunitiesPageWithSort() {
  const { search: _encodedSearch } = useParams<{ search: string }>();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const { sort } = useContext(PostSortContext);
  const jwt = useAppSelector(jwtSelector);

  const search = decodeURIComponent(_encodedSearch);

  const fetchFn: FetchFn<CommunityView> = useCallback(
    async (page) => {
      if (page === 1 && search.includes("@")) {
        return [await findExactCommunity(search, client, jwt)].filter(notEmpty);
      }

      const response = await client.search({
        limit: LIMIT,
        q: search,
        type_: "Communities",
        listing_type: "All",
        page,
        sort,
        auth: jwt,
      });

      return response.communities;
    },
    [client, search, sort, jwt]
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Search"
              defaultHref={buildGeneralBrowseLink("")}
            />
          </IonButtons>

          <IonTitle>“{search}”</IonTitle>

          <IonButtons slot="end">
            <PostSort />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <CommunityFeed fetchFn={fetchFn} />
      </IonContent>
    </IonPage>
  );
}

async function findExactCommunity(
  name: string,
  client: LemmyHttp,
  jwt?: string
): Promise<CommunityView | undefined> {
  const sanitizedName = name.startsWith("!") ? name.slice(1) : name;

  try {
    return (await client.getCommunity({ name: sanitizedName, auth: jwt }))
      .community_view;
  } catch (error) {
    if (error === "couldnt_find_community") return;

    throw error;
  }
}
