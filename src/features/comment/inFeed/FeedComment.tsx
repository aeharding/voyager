import { CommentView } from "lemmy-js-client";
import Comment from "../Comment";
import PostContext from "../../user/PostContext";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { getHandle } from "../../../helpers/lemmy";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";

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
