import Route from "#/routes/common/Route";
import PostDetail from "#/routes/pages/posts/PostPage";

export default [
  <Route
    path="/:tab/:actor/c/:community/comments/:id"
    element={<PostDetail />}
  />,
  <Route
    path="/:tab/:actor/c/:community/comments/:id/:commentPath"
    element={<PostDetail />}
  />,
];
