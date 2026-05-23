import { shieldCheckmark, shieldHalf } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { buildUserLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function addInstance(item: ModlogItem): LogEntryData {
  const removed = item.modlog.is_revert;
  return {
    icon: removed ? shieldHalf : shieldCheckmark,
    title: `${removed ? "Removed" : "Added"} Admin`,
    by: item.moderator,
    role: getAdminRole(item.moderator),
    message: item.target_person ? getHandle(item.target_person) : undefined,
    link: item.target_person ? buildUserLink(item.target_person) : undefined,
    ...buildBaseData(item.modlog),
  };
}
