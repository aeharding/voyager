import { shieldCheckmark, shieldHalf } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { buildUserLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function addCommunity(item: ModlogItem): LogEntryData {
  // For add actions, is_revert means "was removed from mod"
  const removed = item.modlog.is_revert;
  return {
    icon: removed ? shieldHalf : shieldCheckmark,
    title: `${removed ? "Removed" : "Added"} Mod`,
    by: item.moderator,
    role: getAdminRole(item.moderator),
    message:
      item.target_person && item.target_community
        ? `${getHandle(item.target_person)} ${removed ? "from" : "to"} ${getHandle(item.target_community)}`
        : undefined,
    link: item.target_person ? buildUserLink(item.target_person) : undefined,
    ...buildBaseData(item.modlog),
  };
}
