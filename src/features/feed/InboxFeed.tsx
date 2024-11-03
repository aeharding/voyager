import { useCallback } from "react";

import InboxItem, { InboxItemView } from "#/features/inbox/InboxItem";
import { getInboxItemId } from "#/features/inbox/inboxSlice";

import Feed, { FeedProps } from "./Feed";

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
