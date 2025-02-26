import { arrowUndoCircle, trash } from "ionicons/icons";
import { ModRemoveCommunityView } from "lemmy-js-client";

import { buildCommunityLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData } from "./shared";

export default function removeCommunity(
  item: ModRemoveCommunityView,
): LogEntryData {
  return {
    icon: item.mod_remove_community.removed ? trash : arrowUndoCircle,
    title: `${
      item.mod_remove_community.removed ? "Removed" : "Restored"
    } Community`,
    by: item.moderator,
    message: getHandle(item.community),
    link: buildCommunityLink(item.community),
    ...buildBaseData(item.mod_remove_community),
  };
}
