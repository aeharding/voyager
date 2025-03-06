import { trashBin } from "ionicons/icons";
import { AdminPurgePersonView } from "lemmy-js-client";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function purgePerson(item: AdminPurgePersonView): LogEntryData {
  return {
    icon: trashBin,
    title: "Purged User",
    by: item.admin,
    role: getAdminRole(item.admin),
    ...buildBaseData(item.admin_purge_person),
  };
}
