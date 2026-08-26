import route from "#/routes/common/Route";
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
  route("/:tab/:actor/c/:community", <CommunityPage />),
  route(
    "/:tab/:actor/c/:community/search/posts/:search",
    <SearchFeedResultsPage type="posts" />,
  ),
  route(
    "/:tab/:actor/c/:community/search/comments/:search",
    <SearchFeedResultsPage type="comments" />,
  ),
  route("/:tab/:actor/c/:community/sidebar", <CommunitySidebarPage />),
  ...anyPaneGeneral,
  route("/:tab/:actor/c/:community/comments/:id", <PostDetail />),
  route(
    "/:tab/:actor/c/:community/comments/:id/thread/:threadCommentId",
    <PostDetail />,
  ),
  route("/:tab/:actor/c/:community/comments/:id/:commentPath", <PostDetail />),
  route("/:tab/:actor/c/:community/comments", <CommunityCommentsPage />),
  route("/:tab/:actor/c/:community/log", <ModlogPage />),
  route("/:tab/:actor/c/:community/modqueue", <ModqueuePage />),
  route("/:tab/:actor/home", <SpecialFeedPage type="subscribed" />),
  route("/:tab/:actor/all", <SpecialFeedPage type="all" />),
  route("/:tab/:actor/local", <SpecialFeedPage type="local" />),
  route("/:tab/:actor/mod", <SpecialFeedPage type="moderator_view" />),
  route("/:tab/:actor/mod/comments", <CommentsPage type="moderator_view" />),
  route("/:tab/:actor/mod/log", <ModlogPage />),
  route("/:tab/:actor/mod/modqueue", <ModqueuePage />),
  route("/:tab/:actor/u/:handle", <UserPage />),
  route("/:tab/:actor/u/:handle/posts", <ProfileFeedPostsPage />),
  route("/:tab/:actor/u/:handle/comments", <ProfileFeedCommentsPage />),
  route("/:tab/:actor/u/:handle/saved", <ProfileFeedSavedPage />),
  route("/:tab/:actor/u/:handle/hidden", <ProfileFeedHiddenPostsPage />),
  route(
    "/:tab/:actor/u/:handle/upvoted",
    <ProfileFeedVotedPage likeType="liked_only" />,
  ),
  route(
    "/:tab/:actor/u/:handle/downvoted",
    <ProfileFeedVotedPage likeType="disliked_only" />,
  ),
  route("/:tab/:actor/u/:handle/message", <ConversationPage />),
  route("/:tab/:actor/u/:handle/log", <ModlogPage />),
  route("/:tab/:actor/sidebar", <InstanceSidebarPage />),
];
