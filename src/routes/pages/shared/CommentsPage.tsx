import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { ListingType } from "threadiverse";

import { getFeedUrlName } from "#/features/community/mod/ModActions";
import { FetchFn } from "#/features/feed/Feed";
import FeedContextProvider from "#/features/feed/FeedContext";
import PostCommentFeed, {
  PostCommentItem,
} from "#/features/feed/PostCommentFeed";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
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

  const communityNameIfAvailable =
    "communityName" in props ? props.communityName : undefined;

  const fetchFn: FetchFn<PostCommentItem> = async (page_cursor, ...rest) =>
    client.getComments(
      {
        page_cursor,
        limit: LIMIT,
        community_name: communityNameIfAvailable,
        type_: "type" in props ? props.type : undefined,
        sort: "New",
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
