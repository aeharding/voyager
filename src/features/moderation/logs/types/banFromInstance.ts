import { ModBanView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle, getItemActorName } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";
import { buildUserLink } from "../../../../helpers/appLinkBuilder";
import { ban, refresh } from "ionicons/icons";

export default function banFromInstance(item: ModBanView): LogEntryData {
  return {
    icon: item.mod_ban.banned ? ban : refresh,
    title: `${item.mod_ban.banned ? "Banned" : "Unbanned"} User`,
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message:
      getHandle(item.banned_person) +
      (item.moderator ? ` from ${getItemActorName(item.moderator)}` : ""),
    link: buildUserLink(item.banned_person),
    ...buildBaseData(item.mod_ban),
  };
}
