import { IonText } from "@ionic/react";
import { Comment, Post } from "lemmy-js-client";
import { useEffect } from "react";

import { ModeratorRole } from "#/features/moderation/useCanModerate";
import { useAppDispatch, useAppSelector } from "#/store";

import CommentLinks from "./CommentLinks";
import CommentMarkdown from "./CommentMarkdown";
import { getCommentContent, LOADING_CONTENT } from "./commentSlice";

interface CommentContentProps {
  item: Comment | Post;
  showTouchFriendlyLinks?: boolean;
  mdClassName?: string;
  canModerate?: ModeratorRole | undefined;
}

export default function CommentContent({
  item,
  showTouchFriendlyLinks = true,
  mdClassName,
  canModerate,
}: CommentContentProps) {
  const dispatch = useAppDispatch();
  const touchFriendlyLinks = useAppSelector(
    (state) => state.settings.general.comments.touchFriendlyLinks,
  );
  const removedCommentContent = useAppSelector(
    (state) => state.comment.commentContentById[item.id],
  );

  const content = (() => {
    // is post
    if (!("content" in item)) return item.body ?? item.name;

    if (item.content === "") {
      return removedCommentContent ?? "";
    }

    return item.content;
  })();

  useEffect(() => {
    if (!item.removed) return;
    if (!("content" in item)) return; // only comments
    if (content) return;
    if (!canModerate) return;

    dispatch(getCommentContent(item.id));
  }, [item, content, dispatch, canModerate]);

  if (content === LOADING_CONTENT)
    return <IonText color="medium">Loading comment...</IonText>;

  return (
    <>
      <CommentMarkdown className={mdClassName} id={item.ap_id}>
        {content}
      </CommentMarkdown>
      {showTouchFriendlyLinks && touchFriendlyLinks && (
        <CommentLinks markdown={content} />
      )}
    </>
  );
}
