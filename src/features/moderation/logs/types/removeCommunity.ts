import { ModRemoveCommunityView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";
import { buildCommunityLink } from "../../../../helpers/appLinkBuilder";

export default function removeCommunity(
  item: ModRemoveCommunityView,
): LogEntryData {
  return {
    title: `${
      item.mod_remove_community.removed ? "Removed" : "Restored"
    } Community`,
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message: getHandle(item.community),
    link: buildCommunityLink(item.community),
    ...buildBaseData(item.mod_remove_community),
  };
}
