import { personAdd, personRemove } from "ionicons/icons";
import { ModBanFromCommunityView } from "lemmy-js-client";

import { buildUserLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData } from "./shared";

export default function banFromCommunity(
  item: ModBanFromCommunityView,
): LogEntryData {
  return {
    icon: item.mod_ban_from_community.banned ? personRemove : personAdd,
    title: `${
      item.mod_ban_from_community.banned ? "Banned" : "Unbanned"
    } User from Community`,
    by: item.moderator,
    message: `${getHandle(item.banned_person)} from ${getHandle(
      item.community,
    )}`,
    link: buildUserLink(item.banned_person),
    ...buildBaseData(item.mod_ban_from_community),
  };
}
