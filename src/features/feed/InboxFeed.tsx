import InboxItem, { InboxItemView } from "#/features/inbox/InboxItem";
import { getNotificationKey } from "#/features/inbox/inboxSlice";

import Feed, { FeedProps } from "./Feed";

interface PostCommentFeed extends Omit<
  FeedProps<InboxItemView>,
  "renderItemContent"
> {}

export default function InboxFeed({ ...rest }: PostCommentFeed) {
  return (
    <Feed renderItemContent={renderItemContent} getIndex={getIndex} {...rest} />
  );
}

function getIndex(item: InboxItemView): string {
  return getNotificationKey(item.notification);
}

function renderItemContent(item: InboxItemView) {
  return <InboxItem item={item} />;
}
