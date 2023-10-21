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
import { useCallback } from "react";
import { FetchFn } from "../../../features/feed/Feed";
import useClient from "../../../helpers/useClient";
import { LIMIT } from "../../../services/lemmy";
import { useParams } from "react-router";
import PostSort from "../../../features/feed/PostSort";
import { useAppDispatch, useAppSelector } from "../../../store";
import { CommunityView, LemmyHttp } from "lemmy-js-client";
import CommunityFeed from "../../../features/feed/CommunityFeed";
import { notEmpty } from "../../../helpers/array";
import { receivedCommunities } from "../../../features/community/communitySlice";

export default function SearchCommunitiesPage() {
  const { search: _encodedSearch } = useParams<{ search: string }>();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const sort = useAppSelector((state) => state.post.sort);
  const dispatch = useAppDispatch();

  const search = decodeURIComponent(_encodedSearch);

  const fetchFn: FetchFn<CommunityView> = useCallback(
    async (page) => {
      if (page === 1 && search.includes("@")) {
        return [await findExactCommunity(search, client)].filter(notEmpty);
      }

      const response = await client.search({
        limit: LIMIT,
        q: search,
        type_: "Communities",
        listing_type: "All",
        page,
        sort,
      });

      dispatch(receivedCommunities(response.communities));

      return response.communities;
    },
    [client, search, sort, dispatch],
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
): Promise<CommunityView | undefined> {
  const sanitizedName = name.startsWith("!") ? name.slice(1) : name;

  try {
    return (await client.getCommunity({ name: sanitizedName })).community_view;
  } catch (error) {
    if (error === "couldnt_find_community") return;

    throw error;
  }
}
