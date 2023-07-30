import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import { FetchFn } from "../../features/feed/Feed";
import { useCallback } from "react";
import PostSort from "../../features/feed/PostSort";
import { ListingType } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import { useAppSelector } from "../../store";
import PostCommentFeed, {
  PostCommentItem,
} from "../../features/feed/PostCommentFeed";
import { jwtSelector } from "../../features/auth/authSlice";
import TitleSearch from "../../features/community/titleSearch/TitleSearch";
import { TitleSearchProvider } from "../../features/community/titleSearch/TitleSearchProvider";
import TitleSearchResults from "../../features/community/titleSearch/TitleSearchResults";
import FeedScrollObserver from "../../features/feed/FeedScrollObserver";
import { markReadOnScrollSelector } from "../../features/settings/settingsSlice";
import FeedContent from "./FeedContent";
import FeedContextProvider from "../../features/feed/FeedContext";
import SpecialFeedMoreActions from "../../features/feed/SpecialFeedMoreActions";
import PostFabs from "../../features/feed/postFabs/PostFabs";

interface SpecialFeedProps {
  type: ListingType;
}

export default function SpecialFeedPage({ type }: SpecialFeedProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const client = useClient();
  const sort = useAppSelector((state) => state.post.sort);
  const jwt = useAppSelector(jwtSelector);

  const markReadOnScroll = useAppSelector(markReadOnScrollSelector);

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (page) => {
      const response = await client.getPosts({
        limit: LIMIT,
        page,
        sort,
        type_: type,
        auth: jwt,
      });

      return response.posts;
    },
    [client, sort, type, jwt]
  );

  const feed = <PostCommentFeed fetchFn={fetchFn} />;

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
                  <PostSort />
                  <SpecialFeedMoreActions />
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
      </FeedContextProvider>
    </TitleSearchProvider>
  );
}

function listingTypeTitle(type: ListingType): string {
  switch (type) {
    case "All":
    case "Local":
      return type;
    case "Subscribed":
      return "Home";
  }
}
