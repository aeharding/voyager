import { IonButtons, IonHeader, IonPage, IonToolbar } from "@ionic/react";
import { FetchFn } from "../../features/feed/Feed";
import { Redirect, useParams } from "react-router";
import AppBackButton from "../../features/shared/AppBackButton";
import PostSort from "../../features/feed/PostSort";
import MoreActions from "../../features/community/MoreActions";
import { useAppSelector } from "../../store";
import { useCallback } from "react";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import PostCommentFeed, {
  PostCommentItem,
} from "../../features/feed/PostCommentFeed";
import { jwtSelector } from "../../features/auth/authSlice";
import TitleSearch from "../../features/community/titleSearch/TitleSearch";
import TitleSearchResults from "../../features/community/titleSearch/TitleSearchResults";
import { TitleSearchProvider } from "../../features/community/titleSearch/TitleSearchProvider";
import FeedScrollObserver from "../../features/feed/FeedScrollObserver";
import { markReadOnScrollSelector } from "../../features/settings/settingsSlice";
import FeedContent from "./FeedContent";
import FeedContextProvider from "../../features/feed/FeedContext";
import PostFabs from "../../features/feed/postFabs/PostFabs";
import useFetchCommunity from "../../features/community/useFetchCommunity";

export default function CommunityPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { community, actor } = useParams<{
    community: string;
    actor: string;
  }>();

  const client = useClient();
  const sort = useAppSelector((state) => state.post.sort);
  const jwt = useAppSelector(jwtSelector);

  const markReadOnScroll = useAppSelector(markReadOnScrollSelector);
  const communityView = useFetchCommunity(community);

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (page) => {
      const response = await client.getPosts({
        limit: LIMIT,
        page,
        community_name: community,
        sort,
        auth: jwt,
      });
      return response.posts;
    },
    [client, community, sort, jwt],
  );

  if (community.includes("@") && community.split("@")[1] === actor)
    return (
      <Redirect
        to={buildGeneralBrowseLink(`/c/${community.split("@")[0]}`)}
        push={false}
      />
    );

  const feed = <PostCommentFeed fetchFn={fetchFn} communityName={community} />;

  return (
    <FeedContextProvider>
      <TitleSearchProvider>
        <IonPage>
          <IonHeader>
            <IonToolbar>
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
            </IonToolbar>
          </IonHeader>
          <FeedContent>
            {markReadOnScroll ? (
              <FeedScrollObserver>{feed}</FeedScrollObserver>
            ) : (
              feed
            )}
            <TitleSearchResults />
            <PostFabs />
          </FeedContent>
        </IonPage>
      </TitleSearchProvider>
    </FeedContextProvider>
  );
}
