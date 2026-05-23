import { eye, eyeOff } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { buildCommunityLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function hideCommunity(item: ModlogItem): LogEntryData {
  const hidden = !item.modlog.is_revert;
  return {
    icon: hidden ? eyeOff : eye,
    title: `${hidden ? "Hid" : "Unhid"} Community`,
    by: item.moderator,
    role: getAdminRole(item.moderator),
    message: item.target_community
      ? getHandle(item.target_community)
      : undefined,
    link: item.target_community
      ? buildCommunityLink(item.target_community)
      : undefined,
    ...buildBaseData(item.modlog),
  };
}
