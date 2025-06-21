import React from "react";
import { CommentView, PostView } from "threadiverse";

import { OVoteDisplayMode } from "#/services/db";
import { useAppSelector } from "#/store";

import HideVoteMode from "./HideVoteMode";
import SeparateVoteMode from "./SeparateVoteMode";
import TotalVoteMode from "./TotalVoteMode";

interface VoteProps {
  item: PostView | CommentView;
  className?: string;
}

export default function Vote({
  item,
  className,
}: VoteProps): React.ReactElement {
  const voteDisplayMode = useAppSelector(
    (state) => state.settings.appearance.voting.voteDisplayMode,
  );

  switch (voteDisplayMode) {
    case OVoteDisplayMode.Separate:
      return <SeparateVoteMode item={item} className={className} />;

    case OVoteDisplayMode.Hide:
      return <HideVoteMode item={item} className={className} />;

    case OVoteDisplayMode.Total: {
      return <TotalVoteMode item={item} className={className} />;
    }
  }
}
