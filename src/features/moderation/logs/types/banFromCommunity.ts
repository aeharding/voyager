import { personAdd, personRemove } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { buildUserLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData } from "./shared";

export default function banFromCommunity(item: ModlogItem): LogEntryData {
  const banned = !item.modlog.is_revert;
  return {
    icon: banned ? personRemove : personAdd,
    title: `${banned ? "Banned" : "Unbanned"} User from Community`,
    by: item.moderator,
    message:
      item.target_person && item.target_community
        ? `${getHandle(item.target_person)} from ${getHandle(item.target_community)}`
        : undefined,
    link: item.target_person ? buildUserLink(item.target_person) : undefined,
    ...buildBaseData(item.modlog),
  };
}
