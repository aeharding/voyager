import { ModBanFromCommunityView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";
import { buildUserLink } from "../../../../helpers/appLinkBuilder";

export default function banFromCommunity(
  item: ModBanFromCommunityView,
): LogEntryData {
  return {
    title: `${item.mod_ban_from_community.banned ? "Banned" : "Unbanned"} User`,
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message: `${getHandle(item.banned_person)} from ${getHandle(
      item.community,
    )}`,
    link: buildUserLink(item.banned_person),
    ...buildBaseData(item.mod_ban_from_community),
  };
}
