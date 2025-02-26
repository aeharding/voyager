import { trashBin } from "ionicons/icons";
import { AdminPurgeCommunityView } from "lemmy-js-client";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function purgeCommunity(
  item: AdminPurgeCommunityView,
): LogEntryData {
  return {
    icon: trashBin,
    title: "Purged Community",
    by: item.admin,
    role: getAdminRole(item.admin),
    ...buildBaseData(item.admin_purge_community),
  };
}
