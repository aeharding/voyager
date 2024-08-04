import { Comment, Post } from "lemmy-js-client";
import { useMemo } from "react";
import CommentMarkdown from "./CommentMarkdown";
import CommentLinks from "./CommentLinks";
import { useAppSelector } from "../../store";

interface CommentContentProps {
  item: Comment | Post;
  showTouchFriendlyLinks?: boolean;
  mdClassName?: string;
}

export default function CommentContent({
  item,
  showTouchFriendlyLinks = true,
  mdClassName,
}: CommentContentProps) {
  const touchFriendlyLinks = useAppSelector(
    (state) => state.settings.general.comments.touchFriendlyLinks,
  );

  const content = useMemo(() => {
    return (
      <>
        <CommentMarkdown className={mdClassName} id={item.ap_id}>
          {"content" in item ? item.content : (item.body ?? item.name)}
        </CommentMarkdown>
        {showTouchFriendlyLinks && touchFriendlyLinks && (
          <CommentLinks
            markdown={
              "content" in item ? item.content : (item.body ?? item.name)
            }
          />
        )}
      </>
    );
  }, [item, showTouchFriendlyLinks, touchFriendlyLinks, mdClassName]);

  return content;
}
