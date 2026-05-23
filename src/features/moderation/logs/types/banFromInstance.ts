import { ban, refresh } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { buildUserLink } from "#/helpers/appLinkBuilder";
import { getHandle, getItemActorName } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function banFromInstance(item: ModlogItem): LogEntryData {
  const banned = !item.modlog.is_revert;
  return {
    icon: banned ? ban : refresh,
    title: `${banned ? "Banned" : "Unbanned"} User`,
    by: item.moderator,
    role: getAdminRole(item.moderator),
    message: item.target_person
      ? getHandle(item.target_person) +
        (item.moderator ? ` from ${getItemActorName(item.moderator)}` : "")
      : undefined,
    link: item.target_person ? buildUserLink(item.target_person) : undefined,
    ...buildBaseData(item.modlog),
  };
}
