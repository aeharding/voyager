import { AdminPurgeCommunityView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";

export default function purgeCommunity(
  item: AdminPurgeCommunityView,
): LogEntryData {
  return {
    title: "Purged Community",
    by: item.admin ? getHandle(item.admin) : undefined,
    ...buildBaseData(item.admin_purge_community),
  };
}
