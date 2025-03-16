import { shieldCheckmark, shieldHalf } from "ionicons/icons";
import { ModAddCommunityView } from "lemmy-js-client";

import { buildUserLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function addCommunity(item: ModAddCommunityView): LogEntryData {
  return {
    icon: item.mod_add_community.removed ? shieldHalf : shieldCheckmark,
    title: `${item.mod_add_community.removed ? "Removed" : "Added"} Mod`,
    by: item.moderator,
    role: getAdminRole(item.moderator),
    message: `${getHandle(item.modded_person)} ${
      item.mod_add_community.removed ? "from" : "to"
    } ${getHandle(item.community)}`,
    link: buildUserLink(item.modded_person),
    ...buildBaseData(item.mod_add_community),
  };
}
