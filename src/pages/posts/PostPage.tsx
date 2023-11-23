import {
  IonButtons,
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../store";
import { useParams } from "react-router";
import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import { getPost } from "../../features/post/postSlice";
import AppBackButton from "../../features/shared/AppBackButton";
import { CommentSortType } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import CommentSort from "../../features/comment/CommentSort";
import MoreActions from "../../features/post/shared/MoreActions";
import PostDetail from "../../features/post/detail/PostDetail";
import FeedContent from "../shared/FeedContent";
import useClient from "../../helpers/useClient";
import { formatNumber } from "../../helpers/number";
import MoreModActions from "../../features/post/shared/MoreModAction";

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

export default function PostPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { id, commentPath, community, threadCommentId } = useParams<{
    id: string;
    commentPath?: string;
    threadCommentId?: string; // for continuing threads
    community: string;
  }>();
  const post = useAppSelector((state) => state.post.postById[id]);
  const client = useClient();
  const dispatch = useAppDispatch();
  const defaultSort = useAppSelector(
    (state) => state.settings.general.comments.sort,
  );
  const [sort, setSort] = useState<CommentSortType>(defaultSort);
  const postDeletedById = useAppSelector((state) => state.post.postDeletedById);

  const postIfFound = typeof post === "object" ? post : undefined;

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
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <AppBackButton
              defaultHref={buildGeneralBrowseLink(`/c/${community}`)}
              defaultText={postIfFound?.community.name}
            />
          </IonButtons>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            {postIfFound && <MoreModActions post={postIfFound} />}
            <CommentSort sort={sort} setSort={setSort} />
            {postIfFound && <MoreActions post={postIfFound} />}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <FeedContent>{renderPost()}</FeedContent>
    </IonPage>
  );
}
