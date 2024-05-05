import { AdminPurgeCommunityView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData, getAdminRole } from "./shared";
import { trashBin } from "ionicons/icons";

export default function purgeCommunity(
  item: AdminPurgeCommunityView,
): LogEntryData {
  return {
    icon: trashBin,
    title: "Purged Community",
    by: item.admin ? getHandle(item.admin) : undefined,
    role: getAdminRole(item.admin),
    ...buildBaseData(item.admin_purge_community),
  };
}
