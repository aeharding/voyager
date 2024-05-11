import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useParams } from "react-router";
import { styled } from "@linaria/react";
import React, { memo, useCallback, useEffect } from "react";
import { getPost } from "../../../features/post/postSlice";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import CommentSort from "../../../features/comment/CommentSort";
import MoreActions from "../../../features/post/shared/MoreActions";
import PostDetail from "../../../features/post/detail/PostDetail";
import FeedContent from "../shared/FeedContent";
import useClient from "../../../helpers/useClient";
import { formatNumber } from "../../../helpers/number";
import MoreModActions from "../../../features/post/shared/MoreModAction";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { useRef } from "react";
import AppHeader from "../../../features/shared/AppHeader";
import useSortByFeed from "../../../features/feed/sort/useFeedSort";
import { getRemoteHandleFromHandle } from "../../../helpers/lemmy";

export const CenteredSpinner = styled(IonSpinner)`
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

export const AnnouncementIcon = styled(IonIcon)`
  font-size: 1.1rem;
  margin-right: 5px;
  vertical-align: middle;
  color: var(--ion-color-success);
`;

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

const PostPageContent = memo(function PostPageContent({
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
  const [sort, setSort] = useSortByFeed("comments", {
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

  const refresh = useCallback(
    async (event: RefresherCustomEvent) => {
      try {
        await dispatch(getPost(+id));
      } finally {
        event.detail.complete();
      }
    },
    [dispatch, id],
  );

  const buildWithRefresher = useCallback(
    (content: React.ReactNode) => {
      return (
        <>
          <IonRefresher slot="fixed" onIonRefresh={refresh}>
            <IonRefresherContent />
          </IonRefresher>
          {content}
        </>
      );
    },
    [refresh],
  );

  function renderPost() {
    if (!post) return <CenteredSpinner />;
    if (
      post === "not-found" || // 404 from lemmy
      post.post.deleted || // post marked deleted from lemmy
      postDeletedById[post.post.id] // deleted by user recently
    )
      return buildWithRefresher(
        <div className="ion-padding ion-text-center">Post not found</div>,
      );

    if (!sort) return;

    return (
      <PostDetail
        post={post}
        sort={sort}
        commentPath={commentPath}
        threadCommentId={threadCommentId}
      />
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
});

export function postDetailPageHasVirtualScrollEnabled(
  commentPath: string | undefined,
  threadCommentId: string | undefined,
): boolean {
  return !commentPath && !threadCommentId;
}
