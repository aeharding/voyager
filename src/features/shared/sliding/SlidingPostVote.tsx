import { CommentView, PostView } from "threadiverse";

import { useAppSelector } from "#/store";

import { BaseSlidingVote } from "./BaseSliding";

interface SlidingVoteProps extends React.PropsWithChildren {
  className?: string;
  item: CommentView | PostView;
  onHide: () => void;
}

export default function SlidingVote({
  children,
  className,
  item,
  onHide,
}: SlidingVoteProps) {
  const post = useAppSelector((state) => state.gesture.swipe.post);

  return (
    <BaseSlidingVote
      actions={post}
      className={className}
      item={item}
      onHide={onHide}
    >
      {children}
    </BaseSlidingVote>
  );
}
