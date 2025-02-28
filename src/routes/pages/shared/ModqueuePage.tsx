import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { uniqBy } from "es-toolkit";
import {
  CommentReportView,
  CommentView,
  Community,
  PostReportView,
  PostView,
} from "lemmy-js-client";
import { createContext, useContext } from "react";
import { useParams } from "react-router";

import useFetchCommunity from "#/features/community/useFetchCommunity";
import { FetchFn, isFirstPage } from "#/features/feed/Feed";
import FeedContextProvider from "#/features/feed/FeedContext";
import PostCommentFeed, {
  PostCommentItem,
} from "#/features/feed/PostCommentFeed";
import {
  reportsByCommentIdSelector,
  reportsByPostIdSelector,
  syncReports,
} from "#/features/moderation/modSlice";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import { getPostCommentItemCreatedDate } from "#/features/user/Profile";
import { buildCommunityLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";
import store, { useAppDispatch } from "#/store";

import FeedContent from "./FeedContent";

export default function ModqueuePage() {
  const { community } = useParams<{ community?: string }>();

  if (!community) return <GlobalModqueue />;

  return <ModqueueByCommunityName communityName={community} />;
}

function GlobalModqueue() {
  return <ModqueueByCommunity />;
}

function ModqueueByCommunityName({ communityName }: { communityName: string }) {
  const community = useFetchCommunity(communityName);

  if (!community) return <CenteredSpinner />;

  return <ModqueueByCommunity community={community.community} />;
}

function ModqueueByCommunity({ community }: { community?: Community }) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const dispatch = useAppDispatch();

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    const [{ comment_reports }, { post_reports }] = await Promise.all([
      client.listCommentReports(
        {
          ...pageData,
          limit: LIMIT,
          community_id: community?.id,
          unresolved_only: true,
        },
        ...rest,
      ),
      client.listPostReports(
        {
          ...pageData,
          limit: LIMIT,
          community_id: community?.id,
          unresolved_only: true,
        },
        ...rest,
      ),
    ]);

    let needsSync = isFirstPage(pageData);

    const reportsByCommentId = reportsByCommentIdSelector(store.getState());
    const reportsByPostId = reportsByPostIdSelector(store.getState());

    for (const report of comment_reports) {
      if (!reportsByCommentId[report.comment.id]) {
        needsSync = true;
      }
    }
    for (const report of post_reports) {
      if (!reportsByPostId[report.post.id]) {
        needsSync = true;
      }
    }

    if (needsSync) {
      await dispatch(syncReports(true));
    }

    const comments = await uniqBy(comment_reports, (r) => r.comment.id).map(
      convertCommentReportToComment,
    );
    const posts = await uniqBy(post_reports, (r) => r.post.id).map(
      convertPostReportToPost,
    );

    return [...comments, ...posts].sort(
      (a, b) =>
        getPostCommentItemCreatedDate(b) - getPostCommentItemCreatedDate(a),
    );
  };

  return (
    <FeedContextProvider>
      <IonPage>
        <AppHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton
                defaultHref={buildGeneralBrowseLink(
                  community ? buildCommunityLink(community) : "",
                )}
              />
            </IonButtons>
            <IonTitle>
              {community ? getHandle(community) : ""} Modqueue
            </IonTitle>
          </IonToolbar>
        </AppHeader>
        <FeedContent>
          <ModqueueContext value={true}>
            <PostCommentFeed
              fetchFn={fetchFn}
              filterHiddenPosts={false}
              filterKeywordsAndWebsites={false}
            />
          </ModqueueContext>
        </FeedContent>
      </IonPage>
    </FeedContextProvider>
  );
}

function convertPostReportToPost(postReport: PostReportView): PostView {
  return {
    ...postReport,
    creator: postReport.post_creator,

    // The below is mocked because properties are not available.
    // See: https://github.com/LemmyNet/lemmy/issues/4200
    creator_is_moderator: false,
    creator_is_admin: false,
    subscribed: "NotSubscribed",
    saved: false,
    read: false,
    creator_blocked: false,
    unread_comments: 0,
    banned_from_community: false,
  };
}

function convertCommentReportToComment(
  commentReport: CommentReportView,
): CommentView {
  return {
    ...commentReport,
    creator: commentReport.comment_creator,

    // The below is mocked because properties are not available.
    // See: https://github.com/LemmyNet/lemmy/issues/4200
    creator_is_moderator: false,
    creator_is_admin: false,
    creator_blocked: false,
    subscribed: "NotSubscribed",
    saved: false,
    banned_from_community: false,
  };
}

const ModqueueContext = createContext(false);

export function useInModqueue() {
  return useContext(ModqueueContext);
}
