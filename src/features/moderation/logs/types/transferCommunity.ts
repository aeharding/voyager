import { swapHorizontal } from "ionicons/icons";
import { ModTransferCommunityView } from "lemmy-js-client";

import { buildCommunityLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData } from "./shared";

export default function transferCommunity(
  item: ModTransferCommunityView,
): LogEntryData {
  return {
    icon: swapHorizontal,
    title: "Transferred Community",
    by: item.moderator,
    message: `${getHandle(item.community)} to ${getHandle(item.modded_person)}`,
    link: buildCommunityLink(item.community),
    ...buildBaseData(item.mod_transfer_community),
  };
}
