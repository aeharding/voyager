import { ban, refresh } from "ionicons/icons";
import { ModBanView } from "lemmy-js-client";

import { buildUserLink } from "#/helpers/appLinkBuilder";
import { getHandle, getItemActorName } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function banFromInstance(item: ModBanView): LogEntryData {
  return {
    icon: item.mod_ban.banned ? ban : refresh,
    title: `${item.mod_ban.banned ? "Banned" : "Unbanned"} User`,
    by: item.moderator,
    role: getAdminRole(item.moderator),
    message:
      getHandle(item.banned_person) +
      (item.moderator ? ` from ${getItemActorName(item.moderator)}` : ""),
    link: buildUserLink(item.banned_person),
    ...buildBaseData(item.mod_ban),
  };
}
