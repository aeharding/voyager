import {
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { FetchFn, isFirstPage } from "../../features/feed/Feed";
import AppBackButton from "../../features/shared/AppBackButton";
import { useCallback } from "react";
import useClient from "../../helpers/useClient";
import FeedContextProvider from "../../features/feed/FeedContext";
import FeedContent from "./FeedContent";
import {
  CommentReportView,
  CommentView,
  Community,
  PostReportView,
  PostView,
} from "lemmy-js-client";
import useFetchCommunity from "../../features/community/useFetchCommunity";
import { CenteredSpinner } from "../posts/PostPage";
import { useParams } from "react-router";
import { getHandle } from "../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { buildCommunityLink } from "../../helpers/appLinkBuilder";
import PostCommentFeed, {
  PostCommentItem,
} from "../../features/feed/PostCommentFeed";
import { getPostCommentItemCreatedDate } from "../../features/user/Profile";
import { uniqBy } from "lodash";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  reportsByCommentIdSelector,
  reportsByPostIdSelector,
  syncReports,
} from "../../features/moderation/modSlice";
import { LIMIT } from "../../services/lemmy";

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
  const reportsByPostId = useAppSelector(reportsByPostIdSelector);
  const reportsByCommentId = useAppSelector(reportsByCommentIdSelector);

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (pageData) => {
      const [{ comment_reports }, { post_reports }] = await Promise.all([
        client.listCommentReports({
          ...pageData,
          limit: LIMIT,
          community_id: community?.id,
          unresolved_only: true,
        }),
        client.listPostReports({
          ...pageData,
          limit: LIMIT,
          community_id: community?.id,
          unresolved_only: true,
        }),
      ]);

      let needsSync = isFirstPage(pageData);

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
        await dispatch(syncReports());
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client, community, dispatch],
  );

  return (
    <FeedContextProvider>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <AppBackButton
                defaultHref={buildGeneralBrowseLink(
                  community ? buildCommunityLink(community) : "",
                )}
              />
            </IonButtons>
            <IonTitle>
              {community ? getHandle(community) : ""} Modqueue
            </IonTitle>
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
    subscribed: "NotSubscribed",
    saved: false,
    read: false,
    creator_blocked: false,
    unread_comments: 0,
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
    creator_blocked: false,
    subscribed: "NotSubscribed",
    saved: false,
  };
}
