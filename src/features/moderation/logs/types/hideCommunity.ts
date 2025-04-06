import { eye, eyeOff } from "ionicons/icons";
import { ModHideCommunityView } from "lemmy-js-client";

import { buildCommunityLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function hideCommunity(
  item: ModHideCommunityView,
): LogEntryData {
  return {
    icon: item.mod_hide_community.hidden ? eyeOff : eye,
    title: `${item.mod_hide_community.hidden ? "Hid" : "Unhid"} Community`,
    by: item.admin,
    role: getAdminRole(item.admin),
    message: getHandle(item.community),
    link: buildCommunityLink(item.community),
    ...buildBaseData(item.mod_hide_community),
  };
}
