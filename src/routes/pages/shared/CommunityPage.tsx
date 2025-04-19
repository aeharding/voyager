import {
  IonBackButton,
  IonButtons,
  IonSearchbar,
  IonToolbar,
} from "@ionic/react";
import { noop } from "es-toolkit";
import { createContext, useEffect, useRef, useState } from "react";
import { Redirect, useParams } from "react-router";

import ModActions from "#/features/community/mod/ModActions";
import MoreActions from "#/features/community/MoreActions";
import CommunitySearchResults from "#/features/community/search/CommunitySearchResults";
import TitleSearch from "#/features/community/titleSearch/TitleSearch";
import { TitleSearchProvider } from "#/features/community/titleSearch/TitleSearchProvider";
import TitleSearchResults from "#/features/community/titleSearch/TitleSearchResults";
import useFetchCommunity from "#/features/community/useFetchCommunity";
import useGetRandomCommunity from "#/features/community/useGetRandomCommunity";
import { getSortDuration } from "#/features/feed/endItems/EndPost";
import { FetchFn } from "#/features/feed/Feed";
import FeedContextProvider from "#/features/feed/FeedContext";
import { PageTypeContext } from "#/features/feed/PageTypeContext";
import PostCommentFeed, {
  PostCommentItem,
} from "#/features/feed/PostCommentFeed";
import { ShowHiddenPostsProvider } from "#/features/feed/postFabs/HidePostsFab";
import PostFabs from "#/features/feed/postFabs/PostFabs";
import PostSort from "#/features/feed/PostSort";
import useFeedSort from "#/features/feed/sort/useFeedSort";
import useCommonPostFeedParams from "#/features/feed/useCommonPostFeedParams";
import useFeedUpdate from "#/features/feed/useFeedUpdate";
import PostAppearanceProvider, {
  WaitUntilPostAppearanceResolved,
} from "#/features/post/appearance/PostAppearanceProvider";
import AppHeader from "#/features/shared/AppHeader";
import { AppTitleHandle } from "#/features/shared/AppTitle";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import DocumentTitle from "#/features/shared/DocumentTitle";
import { AppPage } from "#/helpers/AppPage";
import { cx } from "#/helpers/css";
import { getRemoteHandleFromHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { LIMIT } from "#/services/lemmy";
import { useAppSelector } from "#/store";

import FeedContent from "./FeedContent";

import styles from "./CommunityPage.module.css";
interface CommunityPageParams {
  community: string;
  actor: string;
}

export default function CommunityPage() {
  const { community, actor } = useParams<CommunityPageParams>();

  return <CommunityPageContent community={community} actor={actor} />;
}

function CommunityPageContent({ community, actor }: CommunityPageParams) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [scrolledPastSearch, setScrolledPastSearch] = useState(false);
  const [_searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useOptimizedIonRouter();
  const getRandomCommunity = useGetRandomCommunity();
  const commonPostFeedParams = useCommonPostFeedParams();

  const appTitleRef = useRef<AppTitleHandle>(undefined);

  const searchOpen = searchQuery || _searchOpen;

  const client = useClient();
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const showHiddenInCommunities = useAppSelector(
    (state) => state.settings.general.posts.showHiddenInCommunities,
  );

  const { notifyFeedUpdated, fetchFnLastUpdated } = useFeedUpdate();

  const postFeed = {
    remoteCommunityHandle: getRemoteHandleFromHandle(
      community,
      connectedInstance,
    ),
  };

  const [sort, setSort] = useFeedSort("posts", postFeed);

  const communityView = useFetchCommunity(community);

  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    fetchFnLastUpdated;

    const { posts, next_page } = await client.getPosts(
      {
        ...pageData,
        ...commonPostFeedParams,
        limit: LIMIT,
        community_name: community,
        sort,
        show_read: true,
      },
      ...rest,
    );
    return { data: posts, next_page };
  };

  const onPull = async () => {
    const search = Object.fromEntries([
      ...new URLSearchParams(router.getRouteInfo()?.search),
    ]);
    if (!search.random) return;

    const foundRandom = await getRandomCommunity();

    if (foundRandom) return false;
  };

  // Force update when loaded, because mod button may appear (and title may need to shrink)
  useEffect(() => {
    appTitleRef.current?.updateLayout();
  }, [communityView]);

  const header = !searchOpen ? (
    <div className={styles.headerContainer}>
      <IonSearchbar
        className={styles.communitySearchbar}
        placeholder={`Search c/${community}`}
        onFocus={() => {
          setSearchOpen(true);
          searchbarRef.current?.setFocus();
        }}
      />
    </div>
  ) : undefined;

  if (community.includes("@") && community.split("@")[1] === actor)
    return (
      <Redirect
        to={buildGeneralBrowseLink(`/c/${community.split("@")[0]}`)}
        push={false}
      />
    );

  const feed = (() => {
    if (!sort) return <CenteredSpinner />;

    return (
      <FeedSearchContext value={{ setScrolledPastSearch }}>
        <PageTypeContext value="community">
          <WaitUntilPostAppearanceResolved>
            <PostCommentFeed
              fetchFn={fetchFn}
              communityName={community}
              sortDuration={getSortDuration(sort)}
              header={header}
              filterHiddenPosts={!showHiddenInCommunities}
              onPull={onPull}
            />
          </WaitUntilPostAppearanceResolved>
        </PageTypeContext>
      </FeedSearchContext>
    );
  })();

  function renderFeed() {
    if (searchQuery)
      return (
        <CommunitySearchResults community={community} query={searchQuery} />
      );

    return feed;
  }

  return (
    <FeedContextProvider>
      <ShowHiddenPostsProvider>
        <PostAppearanceProvider feed={postFeed}>
          <TitleSearchProvider>
            <AppPage>
              <AppHeader>
                <IonToolbar
                  className={cx(
                    styles.toolbar,
                    !searchOpen && !scrolledPastSearch
                      ? styles.toolbarHideBorder
                      : undefined,
                  )}
                >
                  {!searchOpen && (
                    <>
                      <IonButtons slot="start">
                        <IonBackButton
                          defaultHref={buildGeneralBrowseLink("/")}
                        />
                      </IonButtons>
                      {communityView && (
                        <DocumentTitle>
                          {communityView.community.title}
                        </DocumentTitle>
                      )}
                      <TitleSearch name={community} ref={appTitleRef}>
                        <IonButtons slot="end">
                          <ModActions
                            community={communityView}
                            communityHandle={community}
                          />
                          <PostSort sort={sort} setSort={setSort} />
                          <MoreActions community={communityView} />
                        </IonButtons>
                      </TitleSearch>
                    </>
                  )}

                  <IonSearchbar
                    placeholder={`Search c/${community}`}
                    ref={searchbarRef}
                    onBlur={() => setSearchOpen(false)}
                    className={cx(
                      styles.headerSearchbar,
                      !searchOpen ? styles.searchbarHide : undefined,
                    )}
                    showCancelButton="always"
                    showClearButton="never"
                    autocapitalize="on"
                    onIonInput={(e) => setSearchQuery(e.detail.value ?? "")}
                    value={searchQuery}
                    enterkeyhint="search"
                    onKeyDown={(e) => {
                      if (!searchQuery.trim()) return;
                      if (e.key !== "Enter") return;

                      router.push(
                        buildGeneralBrowseLink(
                          `/c/${community}/search/posts/${searchQuery}`,
                        ),
                      );
                    }}
                  />
                </IonToolbar>
              </AppHeader>
              <FeedContent
                className={styles.feedContent}
                color={searchOpen ? "light-bg" : undefined}
              >
                {renderFeed()}
                <TitleSearchResults />
                {!showHiddenInCommunities && (
                  <PostFabs forceRefresh={notifyFeedUpdated} />
                )}
                <div className={styles.fixedBg} slot="fixed" />
              </FeedContent>
            </AppPage>
          </TitleSearchProvider>
        </PostAppearanceProvider>
      </ShowHiddenPostsProvider>
    </FeedContextProvider>
  );
}

interface IFeedSearchContext {
  setScrolledPastSearch: (scrolled: boolean) => void;
}

export const FeedSearchContext = createContext<IFeedSearchContext>({
  setScrolledPastSearch: noop,
});
