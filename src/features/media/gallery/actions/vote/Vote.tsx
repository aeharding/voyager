import { OVoteDisplayMode } from "#/services/db/types";
import { useAppSelector } from "#/store";

import { GalleryPostActionsProps } from "../GalleryPostActions";
import HideVoteMode from "./HideVoteMode";
import SeparateVoteMode from "./SeparateVoteMode";
import TotalVoteMode from "./TotalVoteMode";

export default function Vote({
  post,
}: Pick<GalleryPostActionsProps, "post">): React.ReactElement {
  const voteDisplayMode = useAppSelector(
    (state) => state.settings.appearance.voting.voteDisplayMode,
  );

  switch (voteDisplayMode) {
    case OVoteDisplayMode.Total:
      return <TotalVoteMode post={post} />;

    case OVoteDisplayMode.Separate:
      return <SeparateVoteMode post={post} />;

    case OVoteDisplayMode.Hide:
      return <HideVoteMode post={post} />;
  }
}
