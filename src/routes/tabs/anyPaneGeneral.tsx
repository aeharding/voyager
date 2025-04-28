/* eslint-disable react/jsx-key */
import Route from "#/routes/common/Route";
import PostDetail from "#/routes/pages/posts/PostPage";

export default [
  <Route exact path="/:tab/:actor/c/:community/comments/:id">
    <PostDetail />
  </Route>,
  <Route exact path="/:tab/:actor/c/:community/comments/:id/:commentPath">
    <PostDetail />
  </Route>,
];
