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
import { styled } from "@linaria/react";

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
  type: "Comments" | "Posts" | "Saved";
}
export default function ProfileFeedItemsPage({
  type,
}: ProfileFeedItemsPageProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { handle } = useParams<{ handle: string }>();
  const client = useClient();

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (pageData) => {
      const response = await client.getPersonDetails({
        ...pageData,
        limit: LIMIT,
        username: handle,
        sort: "New",
        saved_only: type === "Saved",
      });

      if (type === "Saved") {
        return [...response.comments, ...response.posts].sort((a, b) =>
          getPublishedDate(b).localeCompare(getPublishedDate(a)),
        );
      }

      return type === "Comments" ? response.comments : response.posts;
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
