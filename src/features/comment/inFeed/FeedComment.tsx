import { CommentView } from "threadiverse";

import PostContext from "#/features/user/PostContext";
import { useOpenCommentInSecondColumnIfNeededProps } from "#/routes/twoColumn/useOpenInSecondColumnIfNeededProps";

import Comment from "../Comment";

interface FeedCommentProps {
  comment: CommentView;
  className?: string;
  showTag?: boolean;
}

export default function FeedComment({
  comment,
  className,
  showTag,
}: FeedCommentProps) {
  const linkProps = useOpenCommentInSecondColumnIfNeededProps(
    comment.comment,
    comment.community,
  );

  return (
    <Comment
      comment={comment}
      context={
        <PostContext post={comment.post} community={comment.community} />
      }
      {...linkProps}
      itemClassName={linkProps.className}
      className={className}
      showTag={showTag}
    />
  );
}
