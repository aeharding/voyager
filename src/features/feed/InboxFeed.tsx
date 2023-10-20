import { useCallback } from "react";
import Feed, { FeedProps } from "./Feed";
import InboxItem, { InboxItemView } from "../inbox/InboxItem";
import { getInboxItemId } from "../inbox/inboxSlice";

interface PostCommentFeed
  extends Omit<FeedProps<InboxItemView>, "renderItemContent"> {}

export default function InboxFeed({ ...rest }: PostCommentFeed) {
  const renderItemContent = useCallback(
    (item: InboxItemView) => <InboxItem item={item} />,
    [],
  );

  return (
    <Feed
      renderItemContent={renderItemContent}
      getIndex={getInboxItemId}
      {...rest}
    />
  );
}
