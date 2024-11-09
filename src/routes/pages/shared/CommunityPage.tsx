import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonSearchbar,
  IonToolbar,
} from "@ionic/react";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";
import { noop } from "es-toolkit";
import {
  createContext,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Redirect, useParams } from "react-router";

import MoreActions from "#/features/community/MoreActions";
import ModActions from "#/features/community/mod/ModActions";
import CommunitySearchResults from "#/features/community/search/CommunitySearchResults";
import TitleSearch from "#/features/community/titleSearch/TitleSearch";
import { TitleSearchProvider } from "#/features/community/titleSearch/TitleSearchProvider";
import TitleSearchResults from "#/features/community/titleSearch/TitleSearchResults";
import useFetchCommunity from "#/features/community/useFetchCommunity";
import useGetRandomCommunity from "#/features/community/useGetRandomCommunity";
import { FetchFn } from "#/features/feed/Feed";
import FeedContextProvider from "#/features/feed/FeedContext";
import { PageTypeContext } from "#/features/feed/PageTypeContext";
import PostCommentFeed, {
  PostCommentItem,
} from "#/features/feed/PostCommentFeed";
import PostSort from "#/features/feed/PostSort";
import { getSortDuration } from "#/features/feed/endItems/EndPost";
import PostFabs from "#/features/feed/postFabs/PostFabs";
import useFeedSort from "#/features/feed/sort/useFeedSort";
import useFeedUpdate from "#/features/feed/useFeedUpdate";
import PostAppearanceProvider, {
  WaitUntilPostAppearanceResolved,
} from "#/features/post/appearance/PostAppearanceProvider";
import AppHeader from "#/features/shared/AppHeader";
import { AppTitleHandle } from "#/features/shared/AppTitle";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import DocumentTitle from "#/features/shared/DocumentTitle";
import { getRemoteHandleFromHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { LIMIT } from "#/services/lemmy";
import { useAppSelector } from "#/store";

import FeedContent from "./FeedContent";

const StyledFeedContent = styled(FeedContent)`
  .ios & {
    --background: var(
      --ion-toolbar-background,
      var(--ion-background-color-step-50, #f7f7f7)
    );
  }
`;

// This isn't great... but it works
// and I can't find a better solution 🤷‍♂️
const FixedBg = styled.div`
  .ios & {
    position: absolute;
    inset: 0;
    background: var(
      --ion-toolbar-background,
      var(--ion-background-color-step-50, #f7f7f7)
    );
    z-index: -2;
  }
`;

const StyledIonToolbar = styled(IonToolbar)`
  .ios & {
    // Weird ionic glitch where adding
    // absolutely positioned searchbar to header misaligns buttons
    ion-buttons {
      margin: auto;
    }
  }
`;

const ionToolbarHideBorderCss = css`
  --border-color: transparent;
`;

const HeaderIonSearchbar = styled(IonSearchbar)`
  position: absolute;
  inset: 0;

  padding-top: 5px !important;

  &.md {
    padding-top: 0 !important;
    padding-left: 0;
    padding-right: 0;

    --box-shadow: none;
  }
`;

const ionSearchbarHideCss = css`
  opacity: 0 !important;
  z-index: -1 !important;
  pointer-events: none !important;
`;

const HeaderContainer = styled.div`
  background: var(
    --ion-toolbar-background,
    var(--ion-background-color-step-50, #f7f7f7)
  );
`;

const CommunitySearchbar = styled(IonSearchbar)`
  padding-top: 0;

  &.md {
    padding-left: 0;
    padding-right: 0;

    --box-shadow: none;
  }

  min-height: 0;
`;

interface CommunityPageParams {
  community: string;
  actor: string;
}

export default function CommunityPage() {
  const { community, actor } = useParams<CommunityPageParams>();

  return <CommunityPageContent community={community} actor={actor} />;
}

const CommunityPageContent = memo(function CommunityPageContent({
  community,
  actor,
}: CommunityPageParams) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [scrolledPastSearch, setScrolledPastSearch] = useState(false);
  const [_searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useOptimizedIonRouter();
  const getRandomCommunity = useGetRandomCommunity();

  const appTitleRef = useRef<AppTitleHandle>(null);

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

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (pageData) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      fetchFnLastUpdated;

      const { posts, next_page } = await client.getPosts({
        ...pageData,
        limit: LIMIT,
        community_name: community,
        sort,
      });
      return { data: posts, next_page };
    },
    [client, community, sort, fetchFnLastUpdated],
  );

  const onPull = async () => {
    const search = Object.fromEntries([
      ...new URLSearchParams(router.getRouteInfo()?.search),
    ]);
    if (!search.random) return;

    const foundRandom = await getRandomCommunity();

    if (foundRandom) return false;
  };

  const feedSearchContextValue = useMemo(() => ({ setScrolledPastSearch }), []);

  // Force update when loaded, because mod button may appear (and title may need to shrink)
  useEffect(() => {
    appTitleRef.current?.updateLayout();
  }, [communityView]);

  const header = useMemo(
    () =>
      !searchOpen ? (
        <HeaderContainer>
          <CommunitySearchbar
            placeholder={`Search c/${community}`}
            onFocus={() => {
              setSearchOpen(true);
              searchbarRef.current?.setFocus();
            }}
          />
        </HeaderContainer>
      ) : undefined,
    [community, searchOpen],
  );

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
      <FeedSearchContext.Provider value={feedSearchContextValue}>
        <PageTypeContext.Provider value="community">
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
        </PageTypeContext.Provider>
      </FeedSearchContext.Provider>
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
      <PostAppearanceProvider feed={postFeed}>
        <TitleSearchProvider>
          <IonPage className={searchOpen ? "grey-bg" : ""}>
            <AppHeader>
              <StyledIonToolbar
                className={
                  !searchOpen && !scrolledPastSearch
                    ? ionToolbarHideBorderCss
                    : undefined
                }
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

                <HeaderIonSearchbar
                  placeholder={`Search c/${community}`}
                  ref={searchbarRef}
                  onBlur={() => setSearchOpen(false)}
                  className={!searchOpen ? ionSearchbarHideCss : undefined}
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
              </StyledIonToolbar>
            </AppHeader>
            <StyledFeedContent>
              {renderFeed()}
              <TitleSearchResults />
              {!showHiddenInCommunities && (
                <PostFabs forceRefresh={notifyFeedUpdated} />
              )}
              <FixedBg slot="fixed" />
            </StyledFeedContent>
          </IonPage>
        </TitleSearchProvider>
      </PostAppearanceProvider>
    </FeedContextProvider>
  );
});

interface IFeedSearchContext {
  setScrolledPastSearch: (scrolled: boolean) => void;
}

export const FeedSearchContext = createContext<IFeedSearchContext>({
  setScrolledPastSearch: noop,
});
