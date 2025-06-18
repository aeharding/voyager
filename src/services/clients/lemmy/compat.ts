import { CommentView, CommunityView, PostView } from "lemmy-js-client";

export function compatLemmyCommunityView(communityView: CommunityView) {
  return {
    ...communityView,
    subscribed: communityView.subscribed === "Subscribed",
  };
}

export function compatLemmyPostView(post: PostView) {
  return {
    ...post,
    subscribed: post.subscribed === "Subscribed",
  };
}

export function compatLemmyCommentView(comment: CommentView) {
  return {
    ...comment,
    subscribed: comment.subscribed === "Subscribed",
  };
}
