import InboxItem, { InboxItemView } from "#/features/inbox/InboxItem";
import { getInboxItemId } from "#/features/inbox/inboxSlice";

import Feed, { FeedProps } from "./Feed";

interface PostCommentFeed
  extends Omit<FeedProps<InboxItemView>, "renderItemContent"> {}

export default function InboxFeed({ ...rest }: PostCommentFeed) {
  return (
    <Feed
      renderItemContent={renderItemContent}
      getIndex={getInboxItemId}
      {...rest}
    />
  );
}

function renderItemContent(item: InboxItemView) {
  return <InboxItem item={item} />;
}
