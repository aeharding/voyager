import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from "@ionic/react";
import { useEffect } from "react";
import { useRef } from "react";
import { useParams } from "react-router";

import { useSetActivePage } from "#/features/auth/AppContext";
import CommentSort from "#/features/comment/CommentSort";
import useFeedSort from "#/features/feed/sort/useFeedSort";
import PostDetail from "#/features/post/detail/PostDetail";
import { getPost } from "#/features/post/postSlice";
import MoreActions from "#/features/post/shared/MoreActions";
import MoreModActions from "#/features/post/shared/MoreModAction";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import DocumentTitle from "#/features/shared/DocumentTitle";
import { getRemoteHandleFromHandle } from "#/helpers/lemmy";
import { formatNumber } from "#/helpers/number";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { useAppDispatch, useAppSelector } from "#/store";

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

function PostPageContent({
  id,
  commentPath,
  community,
  threadCommentId,
}: PostPageParams) {
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

  const pageRef = useRef<HTMLElement>(null);
  const virtualEnabled = postDetailPageHasVirtualScrollEnabled(
    commentPath,
    threadCommentId,
  );

  // TODO This is gets quite hacky when dynamically using virtual scroll view.
  // pageRef should probably be refactored
  useSetActivePage(pageRef, !virtualEnabled);
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
    if (!post) return <CenteredSpinner />;
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

    if (!sort) return;

    return (
      <>
        <DocumentTitle>{post.post.name}</DocumentTitle>
        <PostDetail
          post={post}
          sort={sort}
          commentPath={commentPath}
          threadCommentId={threadCommentId}
        />
      </>
    );
  }

  const title = (() => {
    if (threadCommentId) return "Thread";

    return (
      <>
        {postIfFound ? formatNumber(postIfFound.counts.comments) : ""} Comments
      </>
    );
  })();

  return (
    <IonPage ref={pageRef}>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
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
    </IonPage>
  );
}

export function postDetailPageHasVirtualScrollEnabled(
  commentPath: string | undefined,
  threadCommentId: string | undefined,
): boolean {
  return !commentPath && !threadCommentId;
}
