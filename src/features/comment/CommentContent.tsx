import { Comment, Post } from "lemmy-js-client";

import { useAppSelector } from "#/store";

import CommentLinks from "./CommentLinks";
import CommentMarkdown from "./CommentMarkdown";

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

  return (
    <>
      <CommentMarkdown className={mdClassName} id={item.ap_id}>
        {"content" in item ? item.content : (item.body ?? item.name)}
      </CommentMarkdown>
      {showTouchFriendlyLinks && touchFriendlyLinks && (
        <CommentLinks
          markdown={"content" in item ? item.content : (item.body ?? item.name)}
        />
      )}
    </>
  );
}
