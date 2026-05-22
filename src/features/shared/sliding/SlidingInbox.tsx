import { NotificationView } from "threadiverse";

import { useAppSelector } from "#/store";

import { BaseSlidingDM, BaseSlidingVote } from "./BaseSliding";

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

  if (item.data.type_ === "comment") {
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

  return <>{children}</>;
}
