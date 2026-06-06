import { NotificationView } from "threadiverse";

import { useAppSelector } from "#/store";

import {
  BaseSlidingDM,
  BaseSlidingModAction,
  BaseSlidingVote,
} from "./BaseSliding";

interface SlidingInboxProps extends React.PropsWithChildren {
  className?: string;
  item: NotificationView;
}

export default function SlidingInbox({
  children,
  className,
  item,
}: SlidingInboxProps) {
  const inbox = useAppSelector((state) => state.gesture.swipe.inbox);

  if (item.data.type_ === "private_message") {
    return (
      <BaseSlidingDM
        actions={inbox}
        className={className}
        item={item.data}
        notification={item.notification}
      >
        {children}
      </BaseSlidingDM>
    );
  }

  if (item.data.type_ === "comment" || item.data.type_ === "post") {
    return (
      <BaseSlidingVote
        actions={inbox}
        className={className}
        item={item.data}
        notification={item.notification}
      >
        {children}
      </BaseSlidingVote>
    );
  }

  // mod_action (and any other non-votable kind): keep the swipe affordance
  // so the list stays consistent. Vote/reply/save are no-ops; mark
  // read/unread still works.
  return (
    <BaseSlidingModAction
      actions={inbox}
      className={className}
      notification={item.notification}
    >
      {children}
    </BaseSlidingModAction>
  );
}
