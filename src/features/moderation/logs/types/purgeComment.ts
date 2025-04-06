import { trashBin } from "ionicons/icons";
import { AdminPurgeCommentView } from "lemmy-js-client";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function purgeComment(
  item: AdminPurgeCommentView,
): LogEntryData {
  return {
    icon: trashBin,
    title: "Purged Comment",
    by: item.admin,
    role: getAdminRole(item.admin),
    ...buildBaseData(item.admin_purge_comment),
  };
}
