import { CommentView } from "lemmy-js-client";
import Comment from "../Comment";
import PostContext from "../../user/PostContext";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { useIonRouter } from "@ionic/react";
import { getHandle } from "../../../helpers/lemmy";

interface FeedCommentProps {
  comment: CommentView;
  className?: string;
  modqueue?: boolean;
}

export default function FeedComment({
  comment,
  className,
  modqueue,
}: FeedCommentProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const router = useIonRouter();

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
      modqueue={modqueue}
    />
  );
}
