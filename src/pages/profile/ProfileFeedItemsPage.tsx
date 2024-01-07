import { useCallback } from "react";
import {
  IonLabel,
  IonItem,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import styled from "@emotion/styled";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import { FetchFn } from "../../features/feed/Feed";
import { useParams } from "react-router";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import PostCommentFeed, {
  PostCommentItem,
  isPost,
} from "../../features/feed/PostCommentFeed";
import FeedContent from "../shared/FeedContent";
import { CommentView, GetComments, GetPosts, PostView } from "lemmy-js-client";

export const InsetIonItem = styled(IonItem)`
  --background: var(--ion-tab-bar-background, var(--ion-color-step-50, #fff));
`;

export const SettingLabel = styled(IonLabel)`
  margin-left: 16px;
  flex-grow: initial !important;
`;

const getPublishedDate = (item: PostCommentItem) => {
  if (isPost(item)) {
    return item.post.published;
  } else {
    return item.comment.published;
  }
};

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
    async (pageData) => {
      if (type === "Upvoted" || type === "Downvoted") {
        const requestPayload: GetPosts & GetComments = {
          ...pageData,
          limit: LIMIT,
          sort: "New",
          liked_only: type === "Upvoted",
          disliked_only: type === "Downvoted",
        };

        const [{ posts }, { comments }] = await Promise.all([
          await client.getPosts(requestPayload),
          await client.getComments(requestPayload),
        ]);

        return [...comments, ...posts].sort(comparePostComment);
      }
      const { comments, posts } = await client.getPersonDetails({
        ...pageData,
        limit: LIMIT,
        username: handle,
        sort: "New",
        saved_only: type === "Saved",
      });

      if (type === "Saved") {
        return [...comments, ...posts].sort(comparePostComment);
      }

      return type === "Comments" ? comments : posts;
    },
    [client, handle, type],
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{type}</IonTitle>
          <IonButtons slot="start">
            <IonBackButton
              text={handle}
              defaultHref={buildGeneralBrowseLink(`/u/${handle}`)}
            />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <FeedContent>
        <PostCommentFeed
          fetchFn={fetchFn}
          filterHiddenPosts={false}
          filterKeywords={false}
        />
      </FeedContent>
    </IonPage>
  );
}

function comparePostComment(
  a: PostView | CommentView,
  b: PostView | CommentView,
): number {
  return getPublishedDate(b).localeCompare(getPublishedDate(a));
}
