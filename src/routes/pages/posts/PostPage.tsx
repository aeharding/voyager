import {
  IonButtons,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { CommentSort } from "#/features/comment/CommentSort";
import useFeedSort from "#/features/feed/sort/useFeedSort";
import PostDetail from "#/features/post/detail/PostDetail";
import { getPost } from "#/features/post/postSlice";
import MoreActions from "#/features/post/shared/MoreActions";
import MoreModActions from "#/features/post/shared/MoreModAction";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import DocumentTitle from "#/features/shared/DocumentTitle";
import { AppPage } from "#/helpers/AppPage";
import { getRemoteHandleFromHandle } from "#/helpers/lemmy";
import { formatNumber } from "#/helpers/number";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { AppBackButton } from "#/routes/twoColumn/AppBackButton";
import { useAppDispatch, useAppSelector } from "#/store";

import styles from "./PostPage.module.css";

interface PostPageParams {
  id: string;
  commentPath?: string;
  community: string;
  threadCommentId?: string; // For continuing threads
}

export default function PostPage() {
  const { id, commentPath, community, threadCommentId } =
    useParams<PostPageParams>();

  return (
    <PostPageContent
      id={id}
      commentPath={commentPath}
      community={community}
      threadCommentId={threadCommentId}
    />
  );
}

export function PostPageContent({
  id,
  commentPath,
  community,
  threadCommentId,
  className,
}: PostPageParams & { className?: string }) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const post = useAppSelector((state) => state.post.postById[id]);
  const client = useClient();
  const dispatch = useAppDispatch();

  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const [sort, setSort] = useFeedSort("comments", {
    remoteCommunityHandle: getRemoteHandleFromHandle(
      community,
      connectedInstance,
    ),
  });
  const postDeletedById = useAppSelector((state) => state.post.postDeletedById);

  const postIfFound = typeof post === "object" ? post : undefined;

  // Locally read this session (set on open in PostDetail) → no "X New".
  const locallyReadComments = useAppSelector(
    (state) => state.post.postReadCommentsAtById[id] != null,
  );

  // Snapshot the "X New" count at open. Opening marks comments read (see
  // PostDetail), which hides the live pill — but the title should keep showing
  // how many were new when you opened. Captured before that override lands, so
  // it persists; re-entry (override already set) shows none. Same gate as the
  // pill. Empty on a cold deeplink (no post yet).
  const [newCommentCount] = useState(() => {
    if (locallyReadComments || typeof post !== "object") return undefined;
    const unread = post.unread_comments;
    return unread > 0 && unread !== post.post.comments ? unread : undefined;
  });

  const virtualEnabled = postDetailPageHasVirtualScrollEnabled(
    commentPath,
    threadCommentId,
  );

  const Content = virtualEnabled ? FeedContent : IonContent;

  useEffect(() => {
    if (post) return;

    dispatch(getPost(+id));
  }, [post, client, dispatch, id]);

  async function refresh(event: RefresherCustomEvent) {
    // TODO replace with await when React Compiler doesn't bail
    return dispatch(getPost(+id)).finally(() => {
      event.detail.complete();
    });
  }

  function renderPost() {
    if (!post || sort === undefined) return <CenteredSpinner />;
    if (
      post === "not-found" || // 404 from lemmy
      post.post.deleted || // post marked deleted from lemmy
      postDeletedById[post.post.id] // deleted by user recently
    )
      return (
        <>
          <IonRefresher slot="fixed" onIonRefresh={refresh}>
            <IonRefresherContent />
          </IonRefresher>
          <div className="ion-padding ion-text-center">Post not found</div>
        </>
      );

    return (
      <>
        <DocumentTitle>{post.post.name}</DocumentTitle>
        <PostDetail
          post={post}
          sort={sort}
          commentPath={commentPath}
          threadCommentId={threadCommentId}
          virtualEnabled={virtualEnabled}
        />
      </>
    );
  }

  const title = (() => {
    if (threadCommentId) return "Thread";

    const comments = (
      <>{postIfFound ? formatNumber(postIfFound.post.comments) : ""} Comments</>
    );

    if (newCommentCount == null) return comments;

    return (
      <div className={styles.titleWithUnread}>
        <div>{comments}</div>
        <div className={styles.unreadCount}>
          {formatNumber(newCommentCount)} New
        </div>
      </div>
    );
  })();

  return (
    <AppPage className={className}>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <AppBackButton
              defaultHref={buildGeneralBrowseLink(`/c/${community}`)}
            />
          </IonButtons>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            {postIfFound && <MoreModActions post={postIfFound} />}
            <CommentSort sort={sort} setSort={setSort} />
            {postIfFound && <MoreActions post={postIfFound} />}
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <Content>{renderPost()}</Content>
    </AppPage>
  );
}

function postDetailPageHasVirtualScrollEnabled(
  commentPath: string | undefined,
  threadCommentId: string | undefined,
): boolean {
  return !commentPath && !threadCommentId;
}
