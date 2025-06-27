import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { uniqBy } from "es-toolkit";
import { createContext, use } from "react";
import { useParams } from "react-router";
import {
  CommentReportView,
  CommentView,
  Community,
  PostReportView,
  PostView,
} from "threadiverse";

import useFetchCommunity from "#/features/community/useFetchCommunity";
import { FetchFn } from "#/features/feed/Feed";
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
import { buildCommunityLink } from "#/helpers/appLinkBuilder";
import { AppPage } from "#/helpers/AppPage";
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
    const response = await client.listReports(
      {
        ...pageData,
        limit: LIMIT,
        community_id: community?.id,
        unresolved_only: true,
      },
      ...rest,
    );

    let needsSync = !pageData.page_cursor;

    const reportsByCommentId = reportsByCommentIdSelector(store.getState());
    const reportsByPostId = reportsByPostIdSelector(store.getState());

    for (const report of response.data) {
      if (
        "comment_report" in report &&
        !reportsByCommentId[report.comment.id]
      ) {
        needsSync = true;
      } else if ("post_report" in report && !reportsByPostId[report.post.id]) {
        needsSync = true;
      }
    }

    if (needsSync) {
      await dispatch(syncReports(true));
    }

    const data = uniqBy(response.data, (r) => getUniqueReportId(r)).map(
      convertReportToPostCommentView,
    );

    return { ...response, data };
  };

  return (
    <FeedContextProvider>
      <AppPage>
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
      </AppPage>
    </FeedContextProvider>
  );
}

function convertReportToPostCommentView(
  report: CommentReportView | PostReportView,
): PostCommentItem {
  switch (true) {
    case "comment_report" in report:
      return convertCommentReportToComment(report);
    case "post_report" in report:
      return convertPostReportViewToPostView(report);
    default:
      throw new Error("Invalid report");
  }
}

function convertPostReportViewToPostView(postReport: PostReportView): PostView {
  return {
    ...postReport,
    creator: postReport.post_creator,

    // The below is mocked because properties are not available.
    // See: https://github.com/LemmyNet/lemmy/issues/4200
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
    banned_from_community: false,
  };
}

const ModqueueContext = createContext(false);

export function useInModqueue() {
  return use(ModqueueContext);
}

function getUniqueReportId(report: CommentReportView | PostReportView): string {
  switch (true) {
    case "comment_report" in report:
      return `comment-${report.comment_report.id}`;
    case "post_report" in report:
      return `post-${report.post_report.id}`;
    default:
      throw new Error("Invalid report");
  }
}
