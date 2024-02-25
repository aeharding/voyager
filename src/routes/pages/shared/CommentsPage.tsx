import { IonButtons, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { FetchFn } from "../../../features/feed/Feed";
import AppBackButton from "../../../features/shared/AppBackButton";
import { memo, useCallback } from "react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import useClient from "../../../helpers/useClient";
import { LIMIT } from "../../../services/lemmy";
import PostCommentFeed, {
  PostCommentItem,
} from "../../../features/feed/PostCommentFeed";
import FeedContextProvider from "../../../features/feed/FeedContext";
import FeedContent from "./FeedContent";
import { ListingType } from "lemmy-js-client";
import { listingTypeTitle } from "./SpecialFeedPage";
import { getFeedUrlName } from "../../../features/community/mod/ModActions";
import AppHeader from "../../../features/shared/AppHeader";

type CommentsPageProps =
  | {
      type: ListingType;
    }
  | {
      communityName: string;
    };

function CommentsPage(props: CommentsPageProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const client = useClient();

  const communityNameIfAvailable =
    "communityName" in props ? props.communityName : undefined;

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (pageData) => {
      const { comments } = await client.getComments({
        ...pageData,
        limit: LIMIT,
        community_name: communityNameIfAvailable,
        type_: "type" in props ? props.type : undefined,
        sort: "New",
      });
      return comments;
    },
    [client, props, communityNameIfAvailable],
  );

  const feedName = (() => {
    if ("communityName" in props) return props.communityName;

    return listingTypeTitle(props.type);
  })();

  return (
    <FeedContextProvider>
      <IonPage>
        <AppHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <AppBackButton
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
          <PostCommentFeed fetchFn={fetchFn} />
        </FeedContent>
      </IonPage>
    </FeedContextProvider>
  );
}

export default memo(CommentsPage);
