/* eslint-disable react/jsx-key */
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
  <Route exact path="/:tab/:actor/home">
    <SpecialFeedPage type="Subscribed" />
  </Route>,
  <Route exact path="/:tab/:actor/all">
    <SpecialFeedPage type="All" />
  </Route>,
  <Route exact path="/:tab/:actor/local">
    <SpecialFeedPage type="Local" />
  </Route>,
  <Route exact path="/:tab/:actor/mod">
    <SpecialFeedPage type="ModeratorView" />
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
    <ProfileFeedPostsPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/comments">
    <ProfileFeedCommentsPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/saved">
    <ProfileFeedSavedPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/hidden">
    <ProfileFeedHiddenPostsPage />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/upvoted">
    <ProfileFeedVotedPage type="Upvoted" />
  </Route>,
  <Route exact path="/:tab/:actor/u/:handle/downvoted">
    <ProfileFeedVotedPage type="Downvoted" />
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
