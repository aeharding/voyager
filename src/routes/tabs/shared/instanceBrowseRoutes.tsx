import type { ReactElement } from "react";
import { Route } from "react-router-dom";

import ConversationPage from "#/routes/pages/inbox/ConversationPage";
import CommunitiesPage from "#/routes/pages/posts/CommunitiesPage";
import PostDetail from "#/routes/pages/posts/PostPage";
import ProfileFeedCommentsPage from "#/routes/pages/profile/ProfileFeedCommentsPage";
import ProfileFeedHiddenPostsPage from "#/routes/pages/profile/ProfileFeedHiddenPostsPage";
import ProfileFeedPostsPage from "#/routes/pages/profile/ProfileFeedPostsPage";
import ProfileFeedSavedPage from "#/routes/pages/profile/ProfileFeedSavedPage";
import ProfileFeedVotedPage from "#/routes/pages/profile/ProfileFeedVotedPage";
import UserPage from "#/routes/pages/profile/UserPage";
import SearchFeedResultsPage from "#/routes/pages/search/results/SearchFeedResultsPage";
import CommentsPage from "#/routes/pages/shared/CommentsPage";
import CommunityCommentsPage from "#/routes/pages/shared/CommunityCommentsPage";
import CommunityPage from "#/routes/pages/shared/CommunityPage";
import CommunitySidebarPage from "#/routes/pages/shared/CommunitySidebarPage";
import InstanceSidebarPage from "#/routes/pages/shared/InstanceSidebarPage";
import ModlogPage from "#/routes/pages/shared/ModlogPage";
import ModqueuePage from "#/routes/pages/shared/ModqueuePage";
import SpecialFeedPage from "#/routes/pages/shared/SpecialFeedPage";

/**
 * `Route` elements under `Route path=":actor"` (must be direct children for RR6).
 * When `postsActorIndex`, `/posts/:actor` renders CommunitiesPage (posts tab only).
 */
export function instanceBrowseRouteElements({
  postsActorIndex,
}: {
  postsActorIndex: boolean;
}): ReactElement[] {
  const routes: ReactElement[] = [];
  routes.push(
    <Route key="ib-c" path=":actor/c/:community" element={<CommunityPage />} />,
    <Route
      key="ib-c-search-posts"
      path=":actor/c/:community/search/posts/:search"
      element={<SearchFeedResultsPage type="Posts" />}
    />,
    <Route
      key="ib-c-search-comments"
      path=":actor/c/:community/search/comments/:search"
      element={<SearchFeedResultsPage type="Comments" />}
    />,
    <Route
      key="ib-c-sidebar"
      path=":actor/c/:community/sidebar"
      element={<CommunitySidebarPage />}
    />,
    <Route
      key="ib-c-comments-id"
      path=":actor/c/:community/comments/:id"
      element={<PostDetail />}
    />,
    <Route
      key="ib-c-comments-thread"
      path=":actor/c/:community/comments/:id/thread/:threadCommentId"
      element={<PostDetail />}
    />,
    <Route
      key="ib-c-comments-path"
      path=":actor/c/:community/comments/:id/:commentPath"
      element={<PostDetail />}
    />,
    <Route
      key="ib-c-comments"
      path=":actor/c/:community/comments"
      element={<CommunityCommentsPage />}
    />,
    <Route
      key="ib-c-log"
      path=":actor/c/:community/log"
      element={<ModlogPage />}
    />,
    <Route
      key="ib-c-modqueue"
      path=":actor/c/:community/modqueue"
      element={<ModqueuePage />}
    />,
    <Route
      key="ib-home"
      path=":actor/home"
      element={<SpecialFeedPage type="Subscribed" />}
    />,
    <Route
      key="ib-all"
      path=":actor/all"
      element={<SpecialFeedPage type="All" />}
    />,
    <Route
      key="ib-local"
      path=":actor/local"
      element={<SpecialFeedPage type="Local" />}
    />,
    <Route
      key="ib-mod"
      path=":actor/mod"
      element={<SpecialFeedPage type="ModeratorView" />}
    />,
    <Route
      key="ib-mod-comments"
      path=":actor/mod/comments"
      element={<CommentsPage type="ModeratorView" />}
    />,
    <Route key="ib-mod-log" path=":actor/mod/log" element={<ModlogPage />} />,
    <Route
      key="ib-mod-modqueue"
      path=":actor/mod/modqueue"
      element={<ModqueuePage />}
    />,
    <Route key="ib-u" path=":actor/u/:handle" element={<UserPage />} />,
    <Route
      key="ib-u-posts"
      path=":actor/u/:handle/posts"
      element={<ProfileFeedPostsPage />}
    />,
    <Route
      key="ib-u-comments"
      path=":actor/u/:handle/comments"
      element={<ProfileFeedCommentsPage />}
    />,
    <Route
      key="ib-u-saved"
      path=":actor/u/:handle/saved"
      element={<ProfileFeedSavedPage />}
    />,
    <Route
      key="ib-u-hidden"
      path=":actor/u/:handle/hidden"
      element={<ProfileFeedHiddenPostsPage />}
    />,
    <Route
      key="ib-u-upvoted"
      path=":actor/u/:handle/upvoted"
      element={<ProfileFeedVotedPage type="Upvoted" />}
    />,
    <Route
      key="ib-u-downvoted"
      path=":actor/u/:handle/downvoted"
      element={<ProfileFeedVotedPage type="Downvoted" />}
    />,
    <Route
      key="ib-u-message"
      path=":actor/u/:handle/message"
      element={<ConversationPage />}
    />,
    <Route
      key="ib-u-log"
      path=":actor/u/:handle/log"
      element={<ModlogPage />}
    />,
    <Route
      key="ib-sidebar"
      path=":actor/sidebar"
      element={<InstanceSidebarPage />}
    />,
  );

  return routes;
}
