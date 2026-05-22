import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { CommentSortType, ListingType } from "threadiverse";

import { getFeedUrlName } from "#/features/community/mod/ModActions";
import { FetchFn } from "#/features/feed/Feed";
import FeedContextProvider from "#/features/feed/FeedContext";
import PostCommentFeed, {
  PostCommentItem,
} from "#/features/feed/PostCommentFeed";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useMode } from "#/helpers/threadiverse";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";

import FeedContent from "./FeedContent";
import { listingTypeTitle } from "./SpecialFeedPage";

type CommentsPageProps =
  | {
      type: ListingType;
    }
  | {
      communityName: string;
    };

export default function CommentsPage(props: CommentsPageProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const client = useClient();
  const mode = useMode();

  const communityNameIfAvailable =
    "communityName" in props ? props.communityName : undefined;

  const sortByMode = (() => {
    const sort: CommentSortType = (() => {
      switch (mode) {
        case "lemmyv0":
          return { sort: "New", mode };
        case "lemmyv1":
          return { sort: "new", mode };
        case "piefed":
          return { sort: "New", mode };
        default:
          return { sort: "New", mode: "lemmyv0" };
      }
    })();
    return sort;
  })();

  const fetchFn: FetchFn<PostCommentItem> = async (page_cursor, ...rest) =>
    client.getComments(
      {
        page_cursor,
        limit: LIMIT,
        community_name: communityNameIfAvailable,
        type_: "type" in props ? props.type : undefined,
        ...sortByMode,
      },
      ...rest,
    );

  const feedName = (() => {
    if ("communityName" in props) return props.communityName;

    return listingTypeTitle(props.type);
  })();

  return (
    <FeedContextProvider>
      <AppPage>
        <AppHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton
                defaultHref={buildGeneralBrowseLink(
                  "communityName" in props
                    ? `/c/${props.communityName}`
                    : `/${getFeedUrlName(props.type)}`,
                )}
              />
            </IonButtons>
            <IonTitle>{feedName} Comments</IonTitle>
          </IonToolbar>
        </AppHeader>
        <FeedContent>
          <PostCommentFeed
            fetchFn={fetchFn}
            filterHiddenPosts={false}
            filterKeywordsAndWebsites={false}
          />
        </FeedContent>
      </AppPage>
    </FeedContextProvider>
  );
}
