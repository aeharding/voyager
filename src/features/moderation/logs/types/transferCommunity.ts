import { ModTransferCommunityView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";
import { buildCommunityLink } from "../../../../helpers/appLinkBuilder";
import { swapHorizontal } from "ionicons/icons";

export default function transferCommunity(
  item: ModTransferCommunityView,
): LogEntryData {
  return {
    icon: swapHorizontal,
    title: "Transferred Community",
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message: `${getHandle(item.community)} to ${getHandle(item.modded_person)}`,
    link: buildCommunityLink(item.community),
    ...buildBaseData(item.mod_transfer_community),
  };
}
