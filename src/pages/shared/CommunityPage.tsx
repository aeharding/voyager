import {
  IonButtons,
  IonHeader,
  IonPage,
  IonSearchbar,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { FetchFn } from "../../features/feed/Feed";
import { Redirect, useParams } from "react-router";
import AppBackButton from "../../features/shared/AppBackButton";
import PostSort from "../../features/feed/PostSort";
import MoreActions from "../../features/community/MoreActions";
import { useAppSelector } from "../../store";
import { createContext, useCallback, useRef, useState } from "react";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import PostCommentFeed, {
  PostCommentItem,
} from "../../features/feed/PostCommentFeed";
import TitleSearch from "../../features/community/titleSearch/TitleSearch";
import TitleSearchResults from "../../features/community/titleSearch/TitleSearchResults";
import { TitleSearchProvider } from "../../features/community/titleSearch/TitleSearchProvider";
import FeedScrollObserver from "../../features/feed/FeedScrollObserver";
import { markReadOnScrollSelector } from "../../features/settings/settingsSlice";
import FeedContent from "./FeedContent";
import FeedContextProvider from "../../features/feed/FeedContext";
import PostFabs from "../../features/feed/postFabs/PostFabs";
import useFetchCommunity from "../../features/community/useFetchCommunity";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import CommunitySearchResults from "../../features/community/search/CommunitySearchResults";

const StyledFeedContent = styled(FeedContent)`
  --background: var(
    --ion-toolbar-background,
    var(--ion-color-step-50, #f7f7f7)
  );
`;

const StyledIonToolbar = styled(IonToolbar)<{ hideBorder: boolean }>`
  ${({ hideBorder }) =>
    hideBorder &&
    css`
      --border-color: transparent;
    `}
`;

const HeaderIonSearchbar = styled(IonSearchbar)<{ hideSearch: boolean }>`
  position: absolute;
  inset: 0;

  padding-top: 5px !important;

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

  min-height: 0;
`;

export default function CommunityPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { community, actor } = useParams<{
    community: string;
    actor: string;
  }>();
  const [scrolledPastSearch, setScrolledPastSearch] = useState(false);
  const [_searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useIonRouter();

  const searchOpen = searchQuery || _searchOpen;

  const client = useClient();
  const sort = useAppSelector((state) => state.post.sort);

  const markReadOnScroll = useAppSelector(markReadOnScrollSelector);
  const communityView = useFetchCommunity(community);

  // eslint-disable-next-line no-undef
  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (page) => {
      const response = await client.getPosts({
        limit: LIMIT,
        page,
        community_name: community,
        sort,
      });
      return response.posts;
    },
    [client, community, sort],
  );

  if (community.includes("@") && community.split("@")[1] === actor)
    return (
      <Redirect
        to={buildGeneralBrowseLink(`/c/${community.split("@")[0]}`)}
        push={false}
      />
    );

  const feed = (
    <FeedSearchContext.Provider value={{ setScrolledPastSearch }}>
      <PostCommentFeed
        fetchFn={fetchFn}
        communityName={community}
        header={() =>
          !searchOpen && (
            <HeaderContainer>
              <CommunitySearchbar
                placeholder={`Search c/${community}`}
                onFocus={() => {
                  setSearchOpen(true);
                  searchbarRef.current?.setFocus();
                }}
              />
            </HeaderContainer>
          )
        }
      />
    </FeedSearchContext.Provider>
  );

  function renderFeed() {
    if (searchQuery)
      return (
        <CommunitySearchResults community={community} query={searchQuery} />
      );

    if (!markReadOnScroll) return feed;

    return <FeedScrollObserver>{feed}</FeedScrollObserver>;
  }

  return (
    <FeedContextProvider>
      <TitleSearchProvider>
        <IonPage>
          <IonHeader>
            <StyledIonToolbar hideBorder={!searchOpen && !scrolledPastSearch}>
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
                      <PostSort />
                      <MoreActions community={communityView} />
                    </IonButtons>
                  </TitleSearch>
                </>
              )}
            </StyledIonToolbar>
          </IonHeader>
          <StyledFeedContent>
            {renderFeed()}
            <TitleSearchResults />
            <PostFabs />
          </StyledFeedContent>
        </IonPage>
      </TitleSearchProvider>
    </FeedContextProvider>
  );
}

interface IFeedSearchContext {
  setScrolledPastSearch: (scrolled: boolean) => void;
}

export const FeedSearchContext = createContext<IFeedSearchContext>({
  setScrolledPastSearch: () => {},
});
