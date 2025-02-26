import { trashBin } from "ionicons/icons";
import { AdminPurgePostView } from "lemmy-js-client";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function purgePost(item: AdminPurgePostView): LogEntryData {
  return {
    icon: trashBin,
    title: "Purged Post",
    by: item.admin,
    role: getAdminRole(item.admin),
    ...buildBaseData(item.admin_purge_post),
  };
}
