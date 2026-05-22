import { arrowUndoCircle, trash } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { buildCommunityLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData } from "./shared";

export default function removeCommunity(item: ModlogItem): LogEntryData {
  const removed = !item.modlog.is_revert;
  return {
    icon: removed ? trash : arrowUndoCircle,
    title: `${removed ? "Removed" : "Restored"} Community`,
    by: item.moderator,
    message: item.target_community ? getHandle(item.target_community) : undefined,
    link: item.target_community
      ? buildCommunityLink(item.target_community)
      : undefined,
    ...buildBaseData(item.modlog),
  };
}
