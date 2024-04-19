import { ModRemoveCommunityView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";
import { buildCommunityLink } from "../../../../helpers/appLinkBuilder";
import { arrowUndoCircle, trash } from "ionicons/icons";

export default function removeCommunity(
  item: ModRemoveCommunityView,
): LogEntryData {
  return {
    icon: item.mod_remove_community.removed ? trash : arrowUndoCircle,
    title: `${
      item.mod_remove_community.removed ? "Removed" : "Restored"
    } Community`,
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message: getHandle(item.community),
    link: buildCommunityLink(item.community),
    ...buildBaseData(item.mod_remove_community),
  };
}
