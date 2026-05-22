import { swapHorizontal } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { buildCommunityLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData } from "./shared";

export default function transferCommunity(item: ModlogItem): LogEntryData {
  return {
    icon: swapHorizontal,
    title: "Transferred Community",
    by: item.moderator,
    message:
      item.target_community && item.target_person
        ? `${getHandle(item.target_community)} to ${getHandle(item.target_person)}`
        : undefined,
    link: item.target_community
      ? buildCommunityLink(item.target_community)
      : undefined,
    ...buildBaseData(item.modlog),
  };
}
