import { IonBackButton, IonButtons, IonPage, IonToolbar } from "@ionic/react";
import { ListingType } from "lemmy-js-client";

import { followIdsSelector } from "#/features/auth/siteSlice";
import ModActions from "#/features/community/mod/ModActions";
import TitleSearch from "#/features/community/titleSearch/TitleSearch";
import { TitleSearchProvider } from "#/features/community/titleSearch/TitleSearchProvider";
import TitleSearchResults from "#/features/community/titleSearch/TitleSearchResults";
import { getSortDuration } from "#/features/feed/endItems/EndPost";
import { FetchFn } from "#/features/feed/Feed";
import FeedContextProvider from "#/features/feed/FeedContext";
import { PageTypeContext } from "#/features/feed/PageTypeContext";
import PostCommentFeed, {
  PostCommentItem,
} from "#/features/feed/PostCommentFeed";
import PostFabs from "#/features/feed/postFabs/PostFabs";
import PostSort from "#/features/feed/PostSort";
import useFeedSort from "#/features/feed/sort/useFeedSort";
import SpecialFeedMoreActions from "#/features/feed/SpecialFeedMoreActions";
import useFeedUpdate from "#/features/feed/useFeedUpdate";
import { ShowSubscribedIconContext } from "#/features/labels/links/CommunityLink";
import PostAppearanceProvider, {
  WaitUntilPostAppearanceResolved,
} from "#/features/post/appearance/PostAppearanceProvider";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import DocumentTitle from "#/features/shared/DocumentTitle";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";
import { useAppSelector } from "#/store";

import FeedContent from "./FeedContent";

interface SpecialFeedProps {
  type: ListingType;
}

export default function SpecialFeedPage({ type }: SpecialFeedProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const client = useClient();

  const postFeed = { listingType: type };
  const [sort, setSort] = useFeedSort("posts", postFeed);

  const followIds = useAppSelector(followIdsSelector);
  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );
  const site = useAppSelector((state) => state.site.response);
  const noSubscribedInFeed = useAppSelector(
    (state) => state.settings.general.noSubscribedInFeed,
  );

  const { notifyFeedUpdated, fetchFnLastUpdated } = useFeedUpdate();

  const filterSubscribed =
    noSubscribedInFeed && (type === "All" || type === "Local");

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- fetchFn relies on fetchFnLastUpdated for updates
    fetchFnLastUpdated;

    const { posts, next_page } = await client.getPosts(
      {
        ...pageData,
        limit: LIMIT,
        sort,
        type_: type,
        show_read: true,
      },
      ...rest,
    );

    return { data: posts, next_page };
  };

  function filterSubscribedFn(item: PostCommentItem) {
    if (item.post.featured_community || item.post.featured_local) return true;

    const potentialCommunity =
      communityByHandle[getHandle(item.community).toLowerCase()];
    if (potentialCommunity)
      return potentialCommunity.subscribed === "NotSubscribed";

    return !followIds.includes(item.community.id);
  }

  const feed = (() => {
    // We need the site response to know follows in order to filter
    // subscribed communities before rendering the feed
    if (filterSubscribed && !site) return <CenteredSpinner />;
    if (!sort) return <CenteredSpinner />;

    return (
      <ShowSubscribedIconContext value={type === "All" || type === "Local"}>
        <PageTypeContext value="special-feed">
          <WaitUntilPostAppearanceResolved>
            <PostCommentFeed
              fetchFn={fetchFn}
              sortDuration={getSortDuration(sort)}
              filterOnRxFn={filterSubscribed ? filterSubscribedFn : undefined}
            />
          </WaitUntilPostAppearanceResolved>
        </PageTypeContext>
      </ShowSubscribedIconContext>
    );
  })();

  return (
    <TitleSearchProvider>
      <PostAppearanceProvider feed={postFeed}>
        <FeedContextProvider>
          <IonPage>
            <AppHeader>
              <IonToolbar>
                <IonButtons slot="start">
                  <IonBackButton
                    text="Communities"
                    defaultHref={buildGeneralBrowseLink("")}
                  />
                </IonButtons>

                {site && (
                  <DocumentTitle>{site.site_view.site.name}</DocumentTitle>
                )}
                <TitleSearch name={listingTypeTitle(type)}>
                  <IonButtons slot="end">
                    {type === "ModeratorView" && <ModActions type={type} />}
                    <PostSort sort={sort} setSort={setSort} />
                    <SpecialFeedMoreActions type={type} />
                  </IonButtons>
                </TitleSearch>
              </IonToolbar>
            </AppHeader>
            <FeedContent>
              {feed}
              <TitleSearchResults />
              <PostFabs forceRefresh={notifyFeedUpdated} />
            </FeedContent>
          </IonPage>
        </FeedContextProvider>
      </PostAppearanceProvider>
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
