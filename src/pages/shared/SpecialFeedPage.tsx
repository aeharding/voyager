import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import { FetchFn } from "../../features/feed/Feed";
import { useCallback, useRef } from "react";
import PostSort from "../../features/feed/PostSort";
import { ListingType } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import { useAppSelector } from "../../store";
import PostCommentFeed, {
  PostCommentItem,
} from "../../features/feed/PostCommentFeed";
import TitleSearch from "../../features/community/titleSearch/TitleSearch";
import { TitleSearchProvider } from "../../features/community/titleSearch/TitleSearchProvider";
import TitleSearchResults from "../../features/community/titleSearch/TitleSearchResults";
import FeedContent from "./FeedContent";
import FeedContextProvider from "../../features/feed/FeedContext";
import SpecialFeedMoreActions from "../../features/feed/SpecialFeedMoreActions";
import PostFabs from "../../features/feed/postFabs/PostFabs";
import { getSortDuration } from "../../features/feed/endItems/EndPost";
import { followIdsSelector } from "../../features/auth/authSlice";
import { getHandle } from "../../helpers/lemmy";
import { CenteredSpinner } from "../posts/PostPage";
import ModActions from "../../features/community/mod/ModActions";
import usePostSort from "../../features/feed/usePostSort";

interface SpecialFeedProps {
  type: ListingType;
}

export default function SpecialFeedPage({ type }: SpecialFeedProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const client = useClient();
  const [sort, setSort] = usePostSort();

  const followIds = useAppSelector(followIdsSelector);
  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );
  const site = useAppSelector((state) => state.auth.site);
  const noSubscribedInFeed = useAppSelector(
    (state) => state.settings.general.noSubscribedInFeed,
  );

  const filterSubscribed =
    noSubscribedInFeed && (type === "All" || type === "Local");

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (pageData) => {
      const { posts, next_page } = await client.getPosts({
        ...pageData,
        limit: LIMIT,
        sort,
        type_: type,
      });

      return { data: posts, next_page };
    },
    [client, sort, type],
  );

  const filterSubscribedFn = useCallback(
    (item: PostCommentItem) => {
      if (item.post.featured_community || item.post.featured_local) return true;

      const potentialCommunity = communityByHandle[getHandle(item.community)];
      if (potentialCommunity)
        return potentialCommunity.subscribed === "NotSubscribed";

      return !followIds.includes(item.community.id);
    },
    [followIds, communityByHandle],
  );

  const feed = (() => {
    // We need the site response to know follows in order to filter
    // subscribed communities before rendering the feed
    if (filterSubscribed && !site) return <CenteredSpinner />;

    return (
      <PostCommentFeed
        fetchFn={fetchFn}
        sortDuration={getSortDuration(sort)}
        filterOnRxFn={filterSubscribed ? filterSubscribedFn : undefined}
        autoHideIfConfigured
      />
    );
  })();

  return (
    <TitleSearchProvider>
      <FeedContextProvider>
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonBackButton
                  text="Communities"
                  defaultHref={buildGeneralBrowseLink("")}
                />
              </IonButtons>

              <TitleSearch name={listingTypeTitle(type)}>
                <IonButtons slot="end">
                  {type === "ModeratorView" && <ModActions type={type} />}
                  <PostSort sort={sort} setSort={setSort} />
                  <SpecialFeedMoreActions />
                </IonButtons>
              </TitleSearch>
            </IonToolbar>
          </IonHeader>
          <FeedContent>
            {feed}
            <TitleSearchResults />
            <PostFabs />
          </FeedContent>
        </IonPage>
      </FeedContextProvider>
    </TitleSearchProvider>
  );
}

export function listingTypeTitle(type: ListingType): string {
  switch (type) {
    case "All":
    case "Local":
      return type;
    case "Subscribed":
      return "Home";
    case "ModeratorView":
      return "Modded";
  }
}
