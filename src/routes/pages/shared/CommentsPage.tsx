import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { ListingType } from "lemmy-js-client";

import { getFeedUrlName } from "#/features/community/mod/ModActions";
import { FetchFn } from "#/features/feed/Feed";
import FeedContextProvider from "#/features/feed/FeedContext";
import PostCommentFeed, {
  PostCommentItem,
} from "#/features/feed/PostCommentFeed";
import AppHeader from "#/features/shared/AppHeader";
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

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    const { comments } = await client.getComments(
      {
        ...pageData,
        limit: LIMIT,
        community_name: communityNameIfAvailable,
        type_: "type" in props ? props.type : undefined,
        sort: "New",
      },
      ...rest,
    );
    return comments;
  };

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
          <PostCommentFeed fetchFn={fetchFn} />
        </FeedContent>
      </IonPage>
    </FeedContextProvider>
  );
}
