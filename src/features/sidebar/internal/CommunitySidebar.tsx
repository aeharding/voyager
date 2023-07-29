import { CommunityView } from "lemmy-js-client";
import { useAppSelector } from "../../../store";
import { getHandle } from "../../../helpers/lemmy";
import GenericSidebar from "./GenericSidebar";

interface CommunitySidebarProps {
  community: CommunityView;
}

export default function CommunitySidebar({ community }: CommunitySidebarProps) {
  const mods = useAppSelector(
    (state) => state.community.modsByHandle[getHandle(community.community)]
  );

  return (
    <GenericSidebar
      type="community"
      sidebar={
        community.community.description ??
        "**No community description available**"
      }
      people={mods?.map((m) => m.moderator) ?? []}
      counts={community.counts}
    />
  );
}
