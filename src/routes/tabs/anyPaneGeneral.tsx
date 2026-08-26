import route from "#/routes/common/Route";
import PostDetail from "#/routes/pages/posts/PostPage";

export default [
  route("/:tab/:actor/c/:community/comments/:id", <PostDetail />),
  route("/:tab/:actor/c/:community/comments/:id/:commentPath", <PostDetail />),
];
