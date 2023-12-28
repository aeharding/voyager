import { ModHideCommunityView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";
import { buildCommunityLink } from "../../../../helpers/appLinkBuilder";
import { eye, eyeOff } from "ionicons/icons";

export default function hideCommunity(
  item: ModHideCommunityView,
): LogEntryData {
  return {
    icon: item.mod_hide_community.hidden ? eyeOff : eye,
    title: `${item.mod_hide_community.hidden ? "Hid" : "Unhid"} Community`,
    by: item.admin ? getHandle(item.admin) : undefined,
    message: getHandle(item.community),
    link: buildCommunityLink(item.community),
    ...buildBaseData(item.mod_hide_community),
  };
}
