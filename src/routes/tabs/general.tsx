import Route from "#/routes/common/Route";
import ConversationPage from "#/routes/pages/inbox/ConversationPage";
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

import anyPaneGeneral from "./anyPaneGeneral";

export default [
  <Route path="/:tab/:actor/c/:community" element={<CommunityPage />} />,
  <Route
    path="/:tab/:actor/c/:community/search/posts/:search"
    element={<SearchFeedResultsPage type="Posts" />}
  />,
  <Route
    path="/:tab/:actor/c/:community/search/comments/:search"
    element={<SearchFeedResultsPage type="Comments" />}
  />,
  <Route
    path="/:tab/:actor/c/:community/sidebar"
    element={<CommunitySidebarPage />}
  />,
  ...anyPaneGeneral,
  <Route
    path="/:tab/:actor/c/:community/comments/:id"
    element={<PostDetail />}
  />,
  <Route
    path="/:tab/:actor/c/:community/comments/:id/thread/:threadCommentId"
    element={<PostDetail />}
  />,
  <Route
    path="/:tab/:actor/c/:community/comments/:id/:commentPath"
    element={<PostDetail />}
  />,
  <Route
    path="/:tab/:actor/c/:community/comments"
    element={<CommunityCommentsPage />}
  />,
  <Route path="/:tab/:actor/c/:community/log" element={<ModlogPage />} />,
  <Route
    path="/:tab/:actor/c/:community/modqueue"
    element={<ModqueuePage />}
  />,
  <Route
    path="/:tab/:actor/home"
    element={<SpecialFeedPage type="Subscribed" />}
  />,
  <Route path="/:tab/:actor/all" element={<SpecialFeedPage type="All" />} />,
  <Route
    path="/:tab/:actor/local"
    element={<SpecialFeedPage type="Local" />}
  />,
  <Route
    path="/:tab/:actor/mod"
    element={<SpecialFeedPage type="ModeratorView" />}
  />,
  <Route
    path="/:tab/:actor/mod/comments"
    element={<CommentsPage type="ModeratorView" />}
  />,
  <Route path="/:tab/:actor/mod/log" element={<ModlogPage />} />,
  <Route path="/:tab/:actor/mod/modqueue" element={<ModqueuePage />} />,
  <Route path="/:tab/:actor/u/:handle" element={<UserPage />} />,
  <Route
    path="/:tab/:actor/u/:handle/posts"
    element={<ProfileFeedPostsPage />}
  />,
  <Route
    path="/:tab/:actor/u/:handle/comments"
    element={<ProfileFeedCommentsPage />}
  />,
  <Route
    path="/:tab/:actor/u/:handle/saved"
    element={<ProfileFeedSavedPage />}
  />,
  <Route
    path="/:tab/:actor/u/:handle/hidden"
    element={<ProfileFeedHiddenPostsPage />}
  />,
  <Route
    path="/:tab/:actor/u/:handle/upvoted"
    element={<ProfileFeedVotedPage type="Upvoted" />}
  />,
  <Route
    path="/:tab/:actor/u/:handle/downvoted"
    element={<ProfileFeedVotedPage type="Downvoted" />}
  />,
  <Route
    path="/:tab/:actor/u/:handle/message"
    element={<ConversationPage />}
  />,
  <Route path="/:tab/:actor/u/:handle/log" element={<ModlogPage />} />,
  <Route path="/:tab/:actor/sidebar" element={<InstanceSidebarPage />} />,
];
