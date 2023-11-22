import { ModTransferCommunityView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";
import { buildCommunityLink } from "../../../../helpers/appLinkBuilder";

export default function transferCommunity(
  item: ModTransferCommunityView,
): LogEntryData {
  return {
    title: "Transferred Community",
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message: getHandle(item.community),
    link: buildCommunityLink(item.community),
    ...buildBaseData(item.mod_transfer_community),
  };
}
