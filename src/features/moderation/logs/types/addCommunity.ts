import { ModAddCommunityView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";
import { buildUserLink } from "../../../../helpers/appLinkBuilder";

export default function addCommunity(item: ModAddCommunityView): LogEntryData {
  return {
    title: `${item.mod_add_community.removed ? "Added" : "Removed"} Mod`,
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message: getHandle(item.modded_person),
    link: buildUserLink(item.modded_person),
    ...buildBaseData(item.mod_add_community),
  };
}
