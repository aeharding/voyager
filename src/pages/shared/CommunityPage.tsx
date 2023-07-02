import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { FetchFn } from "../../features/feed/Feed";
import { Redirect, useParams } from "react-router";
import AppBackButton from "../../features/shared/AppBackButton";
import PostSort from "../../features/feed/PostSort";
import MoreActions from "../../features/community/MoreActions";
import { useAppDispatch, useAppSelector } from "../../store";
import { useCallback, useContext, useEffect, useState } from "react";
import { getCommunity } from "../../features/community/communitySlice";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import PostCommentFeed, {
  PostCommentItem,
} from "../../features/feed/PostCommentFeed";
import { jwtSelector } from "../../features/auth/authSlice";
import { NewPostContextProvider } from "../../features/post/new/NewPostModal";
import ScrollToTopFab from "../../features/shared/scroll/ScrollToTopFab";
import {
  activateFabOnPagePosition,
  scrollFabIfNeeded,
} from "../../features/shared/scroll/scrollUtils";
import { AppContext } from "../../features/auth/AppContext";

export default function CommunityPage() {
  const { activePage } = useContext(AppContext);
  const [previousTop, setPreviousTop] = useState(0);
  const [fabActivated, setFabActivated] = useState(false);
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
  const sort = useAppSelector((state) => state.post.sort);
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
      <IonPage
        onScrollCapture={() =>
          activateFabOnPagePosition(
            activePage,
            previousTop,
            fabActivated,
            setFabActivated
          )
        }
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <AppBackButton
                defaultText="Communities"
                defaultHref={buildGeneralBrowseLink("/")}
              />
            </IonButtons>

            <IonTitle>{community}</IonTitle>

            <IonButtons slot="end">
              <PostSort />
              <MoreActions community={community} />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <PostCommentFeed fetchFn={fetchFn} communityName={community} />
          <ScrollToTopFab
            activated={fabActivated}
            onClick={() =>
              scrollFabIfNeeded(
                activePage,
                previousTop,
                setPreviousTop,
                setFabActivated
              )
            }
          />
        </IonContent>
      </IonPage>
    </NewPostContextProvider>
  );
}
