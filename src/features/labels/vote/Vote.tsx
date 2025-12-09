import React from "react";
import { CommentView, PostView } from "threadiverse";

import { OVoteDisplayMode } from "#/services/db/types";
import { useAppSelector } from "#/store";

import HideVoteMode from "./HideVoteMode";
import SeparateVoteMode from "./SeparateVoteMode";
import TotalVoteMode from "./TotalVoteMode";

export interface VoteProps {
  item: PostView | CommentView;
  className?: string;
  colorized?: boolean;
}

export default function Vote(props: VoteProps): React.ReactElement {
  const voteDisplayMode = useAppSelector(
    (state) => state.settings.appearance.voting.voteDisplayMode,
  );

  switch (voteDisplayMode) {
    case OVoteDisplayMode.Separate:
      return <SeparateVoteMode {...props} />;

    case OVoteDisplayMode.Hide:
      return <HideVoteMode {...props} />;

    case OVoteDisplayMode.Total: {
      return <TotalVoteMode {...props} />;
    }
  }
}
