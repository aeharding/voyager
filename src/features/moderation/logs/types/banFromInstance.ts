import { ModBanView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";
import { buildUserLink } from "../../../../helpers/appLinkBuilder";

export default function banFromInstance(item: ModBanView): LogEntryData {
  return {
    title: `${item.mod_ban.banned ? "Banned" : "Unbanned"} User [instance]`,
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message: getHandle(item.banned_person),
    link: buildUserLink(item.banned_person),
    ...buildBaseData(item.mod_ban),
  };
}
