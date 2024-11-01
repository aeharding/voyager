import { useCallback } from "react";
import {
  IonPage,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import useClient from "../../../helpers/useClient";
import { LIMIT } from "../../../services/lemmy";
import { FetchFn } from "../../../features/feed/Feed";
import { useParams } from "react-router";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import PostCommentFeed, {
  PostCommentItem,
} from "../../../features/feed/PostCommentFeed";
import FeedContent from "../shared/FeedContent";
import { GetComments, GetPosts } from "lemmy-js-client";
import { sortPostCommentByPublished } from "../../../helpers/lemmy";
import AppHeader from "../../../features/shared/AppHeader";

interface ProfileFeedItemsPageProps {
  type: "Comments" | "Posts" | "Saved" | "Upvoted" | "Downvoted";
}
export default function ProfileFeedItemsPage({
  type,
}: ProfileFeedItemsPageProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { handle } = useParams<{ handle: string }>();
  const client = useClient();

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (pageData, ...rest) => {
      if (type === "Upvoted" || type === "Downvoted") {
        const requestPayload: GetPosts & GetComments = {
          ...pageData,
          limit: Math.floor(LIMIT / 2),
          sort: "New",
          liked_only: type === "Upvoted",
          disliked_only: type === "Downvoted",
        };

        const [{ posts }, { comments }] = await Promise.all([
          client.getPosts(requestPayload, ...rest),
          client.getComments(requestPayload, ...rest),
        ]);

        return [...comments, ...posts].sort(sortPostCommentByPublished);
      }
      const { comments, posts } = await client.getPersonDetails(
        {
          ...pageData,
          limit: LIMIT,
          username: handle,
          sort: "New",
          saved_only: type === "Saved",
        },
        ...rest,
      );

      if (type === "Saved") {
        return [...comments, ...posts].sort(sortPostCommentByPublished);
      }

      return type === "Comments" ? comments : posts;
    },
    [client, handle, type],
  );

  return (
    <IonPage>
      <AppHeader>
        <IonToolbar>
          <IonTitle>{type}</IonTitle>
          <IonButtons slot="start">
            <IonBackButton
              text={handle}
              defaultHref={buildGeneralBrowseLink(`/u/${handle}`)}
            />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <FeedContent>
        <PostCommentFeed
          fetchFn={fetchFn}
          filterHiddenPosts={false}
          filterKeywordsAndWebsites={false}
        />
      </FeedContent>
    </IonPage>
  );
}
