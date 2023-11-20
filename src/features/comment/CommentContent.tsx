import { Comment, Post } from "lemmy-js-client";
import { useMemo } from "react";
import CommentMarkdown from "./CommentMarkdown";
import CommentLinks from "./links/CommentLinks";
import { useAppSelector } from "../../store";

interface CommentContentProps {
  item: Comment | Post;
  showTouchFriendlyLinks?: boolean;
  isMod?: boolean;
}

export default function CommentContent({
  item,
  isMod,
  showTouchFriendlyLinks = true,
}: CommentContentProps) {
  const touchFriendlyLinks = useAppSelector(
    (state) => state.settings.general.comments.touchFriendlyLinks,
  );

  const content = useMemo(() => {
    if (item.deleted)
      return (
        <p>
          <i>deleted by creator</i>
        </p>
      );
    if (item.removed && !isMod)
      return (
        <p>
          <i>removed by mod</i>
        </p>
      );

    return (
      <>
        <CommentMarkdown>
          {"content" in item ? item.content : item.body ?? item.name}
        </CommentMarkdown>
        {showTouchFriendlyLinks && touchFriendlyLinks && (
          <CommentLinks
            markdown={"content" in item ? item.content : item.body ?? item.name}
          />
        )}
      </>
    );
  }, [item, showTouchFriendlyLinks, touchFriendlyLinks, isMod]);

  return content;
}
