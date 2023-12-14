import {
  IonButtons,
  IonHeader,
  IonPage,
  IonSearchbar,
  IonToolbar,
} from "@ionic/react";
import { FetchFn } from "../../features/feed/Feed";
import { Redirect, useParams } from "react-router";
import AppBackButton from "../../features/shared/AppBackButton";
import PostSort from "../../features/feed/PostSort";
import MoreActions from "../../features/community/MoreActions";
import {
  createContext,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import PostCommentFeed, {
  PostCommentItem,
} from "../../features/feed/PostCommentFeed";
import TitleSearch from "../../features/community/titleSearch/TitleSearch";
import TitleSearchResults from "../../features/community/titleSearch/TitleSearchResults";
import { TitleSearchProvider } from "../../features/community/titleSearch/TitleSearchProvider";
import FeedContent from "./FeedContent";
import FeedContextProvider from "../../features/feed/FeedContext";
import PostFabs from "../../features/feed/postFabs/PostFabs";
import useFetchCommunity from "../../features/community/useFetchCommunity";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import CommunitySearchResults from "../../features/community/search/CommunitySearchResults";
import { getSortDuration } from "../../features/feed/endItems/EndPost";
import ModActions from "../../features/community/mod/ModActions";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";
import useFeedSort from "../../features/feed/sort/useFeedSort";
import { CenteredSpinner } from "../posts/PostPage";
import { getRemoteHandleFromHandle } from "../../helpers/lemmy";
import { useAppSelector } from "../../store";
import { PageTypeContext } from "../../features/feed/PageTypeContext";

const StyledFeedContent = styled(FeedContent)`
  .ios & {
    --background: var(
      --ion-toolbar-background,
      var(--ion-color-step-50, #f7f7f7)
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
      var(--ion-color-step-50, #f7f7f7)
    );
    z-index: -2;
  }
`;

const StyledIonToolbar = styled(IonToolbar)<{ hideBorder: boolean }>`
  ${({ hideBorder }) =>
    hideBorder &&
    css`
      --border-color: transparent;
    `}

  // Weird ionic glitch where adding
  // absolutely positioned searchbar to header misaligns buttons
  ion-buttons {
    margin: auto;
  }
`;

const HeaderIonSearchbar = styled(IonSearchbar)<{ hideSearch: boolean }>`
  position: absolute;
  inset: 0;

  padding-top: 5px !important;

  &.md {
    padding-top: 0 !important;
    padding-left: 0;
    padding-right: 0;

    --box-shadow: none;
  }

  ${({ hideSearch }) =>
    hideSearch &&
    css`
      opacity: 0 !important;
      z-index: -1 !important;
      pointer-events: none !important;
    `}
`;

const HeaderContainer = styled.div`
  background: var(--ion-toolbar-background, var(--ion-color-step-50, #f7f7f7));
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

  const searchOpen = searchQuery || _searchOpen;

  const client = useClient();
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const [sort, setSort] = useFeedSort({
    remoteCommunityHandle: getRemoteHandleFromHandle(
      community,
      connectedInstance,
    ),
  });

  const communityView = useFetchCommunity(community);

  // eslint-disable-next-line no-undef
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (pageData) => {
      const { posts, next_page } = await client.getPosts({
        ...pageData,
        limit: LIMIT,
        community_name: community,
        sort,
      });
      return { data: posts, next_page };
    },
    [client, community, sort],
  );

  const feedSearchContextValue = useMemo(() => ({ setScrolledPastSearch }), []);

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

  const feed = sort ? (
    <FeedSearchContext.Provider value={feedSearchContextValue}>
      <PageTypeContext.Provider value="community">
        <PostCommentFeed
          fetchFn={fetchFn}
          communityName={community}
          sortDuration={getSortDuration(sort)}
          header={header}
        />
      </PageTypeContext.Provider>
    </FeedSearchContext.Provider>
  ) : (
    <CenteredSpinner />
  );

  function renderFeed() {
    if (searchQuery)
      return (
        <CommunitySearchResults community={community} query={searchQuery} />
      );

    return feed;
  }

  return (
    <FeedContextProvider>
      <TitleSearchProvider>
        <IonPage className={searchOpen ? "grey-bg" : ""}>
          <IonHeader>
            <StyledIonToolbar hideBorder={!searchOpen && !scrolledPastSearch}>
              {!searchOpen && (
                <>
                  <IonButtons slot="start">
                    <AppBackButton
                      defaultText="Communities"
                      defaultHref={buildGeneralBrowseLink("/")}
                    />
                  </IonButtons>
                  <TitleSearch name={community}>
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
                hideSearch={!searchOpen}
                showCancelButton="always"
                showClearButton="never"
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
          </IonHeader>
          <StyledFeedContent>
            {renderFeed()}
            <TitleSearchResults />
            <PostFabs />
            <FixedBg slot="fixed" />
          </StyledFeedContent>
        </IonPage>
      </TitleSearchProvider>
    </FeedContextProvider>
  );
});

interface IFeedSearchContext {
  setScrolledPastSearch: (scrolled: boolean) => void;
}

export const FeedSearchContext = createContext<IFeedSearchContext>({
  setScrolledPastSearch: () => {},
});
