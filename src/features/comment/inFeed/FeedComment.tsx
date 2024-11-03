import { CommentView } from "lemmy-js-client";

import PostContext from "#/features/user/PostContext";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

import Comment from "../Comment";

interface FeedCommentProps {
  comment: CommentView;
  className?: string;
}

export default function FeedComment({ comment, className }: FeedCommentProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const router = useOptimizedIonRouter();

  return (
    <Comment
      comment={comment}
      context={
        <PostContext post={comment.post} community={comment.community} />
      }
      className={className}
      onClick={() =>
        router.push(
          buildGeneralBrowseLink(
            `/c/${getHandle(comment.community)}/comments/${comment.post.id}/${
              comment.comment.path
            }`,
          ),
        )
      }
    />
  );
}
