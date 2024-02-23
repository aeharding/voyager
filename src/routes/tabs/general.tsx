/* eslint-disable react/jsx-key */

import Route from "../common/Route";
import SearchFeedResultsPage from "../pages/search/results/SearchFeedResultsPage";
import CommunityPage from "../pages/shared/CommunityPage";
import CommunitySidebarPage from "../pages/shared/CommunitySidebarPage";
import PostDetail from "../pages/posts/PostPage";
import CommunityCommentsPage from "../pages/shared/CommunityCommentsPage";
import ModlogPage from "../pages/shared/ModlogPage";
import ModqueuePage from "../pages/shared/ModqueuePage";
import CommentsPage from "../pages/shared/CommentsPage";
import UserPage from "../pages/profile/UserPage";
import ProfileFeedItemsPage from "../pages/profile/ProfileFeedItemsPage";
import ProfileFeedHiddenPostsPage from "../pages/profile/ProfileFeedHiddenPostsPage";
import ConversationPage from "../pages/inbox/ConversationPage";
import InstanceSidebarPage from "../pages/shared/InstanceSidebarPage";

export default [
  <Route exact path="/:tab/:actor/c/:community">
    <CommunityPage />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/search/posts/:search">
    <SearchFeedResultsPage type="Posts" />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/search/comments/:search">
    <SearchFeedResultsPage type="Comments" />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/sidebar">
    <CommunitySidebarPage />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/comments/:id">
    <PostDetail />
  </Route>,
  <Route
    exact
    path="/:tab/:actor/c/:community/comments/:id/thread/:threadCommentId"
  >
    <PostDetail />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/comments/:id/:commentPath">
    <PostDetail />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/comments">
    <CommunityCommentsPage />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/log">
    <ModlogPage />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/modqueue">
    <ModqueuePage />
  </Route>,
  <Route exact path="/:tab/:actor/mod/comments">
    <CommentsPage type="ModeratorView" />
  </Route>,
  <Route exact path="/:tab/:actor/mod/log">
    <ModlogPage />
  </Route>,
  <Route exact path="/:tab/:actor/mod/modqueue">
    <ModqueuePage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle">
    <UserPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/posts">
    <ProfileFeedItemsPage type="Posts" />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/comments">
    <ProfileFeedItemsPage type="Comments" />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/saved">
    <ProfileFeedItemsPage type="Saved" />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/hidden">
    <ProfileFeedHiddenPostsPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/message">
    <ConversationPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/log">
    <ModlogPage />
  </Route>,
  <Route exact path="/:tab/:actor/sidebar">
    <InstanceSidebarPage />
  </Route>,
];
