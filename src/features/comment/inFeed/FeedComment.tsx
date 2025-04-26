import { CommentView } from "lemmy-js-client";

import PostContext from "#/features/user/PostContext";
import useActivatedClass from "#/routes/twoColumn/useActivatedClass";
import { useOpenPostCommentProps } from "#/routes/twoColumn/useOpenPostCommentProps";

import Comment from "../Comment";

interface FeedCommentProps {
  comment: CommentView;
  className?: string;
}

export default function FeedComment({ comment, className }: FeedCommentProps) {
  return (
    <Comment
      comment={comment}
      context={
        <PostContext post={comment.post} community={comment.community} />
      }
      className={className}
      itemClassName={useActivatedClass(comment)}
      {...useOpenPostCommentProps(comment.comment, comment.community)}
    />
  );
}
