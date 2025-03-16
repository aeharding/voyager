import { shieldCheckmark, shieldHalf } from "ionicons/icons";
import { ModAddView } from "lemmy-js-client";

import { buildUserLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function addInstance(item: ModAddView): LogEntryData {
  return {
    icon: item.mod_add.removed ? shieldHalf : shieldCheckmark,
    title: `${item.mod_add.removed ? "Removed" : "Added"} Admin`,
    by: item.moderator,
    role: getAdminRole(item.moderator),
    message: getHandle(item.modded_person),
    link: buildUserLink(item.modded_person),
    ...buildBaseData(item.mod_add),
  };
}
