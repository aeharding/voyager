import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import { FetchFn } from "../../features/feed/Feed";
import { Redirect, useParams } from "react-router";
import AppBackButton from "../../features/shared/AppBackButton";
import PostSort from "../../features/feed/postSort/PostSort";
import MoreActions from "../../features/community/MoreActions";
import { useAppDispatch, useAppSelector } from "../../store";
import { useCallback, useContext, useEffect } from "react";
import { getCommunity } from "../../features/community/communitySlice";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import PostCommentFeed, {
  PostCommentItem,
} from "../../features/feed/PostCommentFeed";
import { jwtSelector } from "../../features/auth/authSlice";
import { NewPostContextProvider } from "../../features/post/new/NewPostModal";
import TitleSearch from "../../features/community/titleSearch/TitleSearch";
import TitleSearchResults from "../../features/community/titleSearch/TitleSearchResults";
import { TitleSearchProvider } from "../../features/community/titleSearch/TitleSearchProvider";
import {
  PostSortContext,
  PostSortContextProvider,
} from "../../features/feed/postSort/PostSortProvider";

export default function CommunityPageWithSort() {
  return (
    <PostSortContextProvider>
      <CommunityPage />
    </PostSortContextProvider>
  );
}

function CommunityPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const { community, actor } = useParams<{
    community: string;
    actor: string;
  }>();

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle
  );

  const client = useClient();
  const { sort } = useContext(PostSortContext);
  const jwt = useAppSelector(jwtSelector);

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
    [client, community, sort, jwt]
  );

  useEffect(() => {
    if (communityByHandle[community]) return;

    dispatch(getCommunity(community));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community]);

  if (community.includes("@") && community.split("@")[1] === actor)
    return (
      <Redirect
        to={buildGeneralBrowseLink(`/c/${community.split("@")[0]}`)}
        push={false}
      />
    );

  return (
    <NewPostContextProvider community={community}>
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
                  <MoreActions community={community} />
                </IonButtons>
              </TitleSearch>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <PostCommentFeed fetchFn={fetchFn} communityName={community} />
            <TitleSearchResults />
          </IonContent>
        </IonPage>
      </TitleSearchProvider>
    </NewPostContextProvider>
  );
}
