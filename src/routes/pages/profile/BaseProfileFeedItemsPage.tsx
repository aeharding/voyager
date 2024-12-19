import { IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { IonPage } from "@ionic/react";
import { IonBackButton } from "@ionic/react";
import { useParams } from "react-router-dom";

import { FetchFn } from "#/features/feed/Feed";
import PostCommentFeed, {
  PostCommentItem,
} from "#/features/feed/PostCommentFeed";
import AppHeader from "#/features/shared/AppHeader";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import FeedContent from "#/routes/pages/shared/FeedContent";

interface BaseProfileFeedItemsPageProps {
  label: string;
  fetchFn: FetchFn<PostCommentItem>;
  sortComponent?: React.ReactNode;
}

export default function BaseProfileFeedItemsPage({
  fetchFn,
  sortComponent,
  label,
}: BaseProfileFeedItemsPageProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { handle } = useParams<{ handle: string }>();

  return (
    <IonPage>
      <AppHeader>
        <IonToolbar>
          <IonTitle>{label}</IonTitle>
          <IonButtons slot="start">
            <IonBackButton
              // Kinda hacky since Ionic doesn't handle clipping
              text={handle.length > 10 ? `${handle.slice(0, 10)}...` : handle}
              defaultHref={buildGeneralBrowseLink(`/u/${handle}`)}
            />
          </IonButtons>

          {sortComponent && <IonButtons slot="end">{sortComponent}</IonButtons>}
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
