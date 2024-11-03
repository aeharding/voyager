import { trashBin } from "ionicons/icons";
import { AdminPurgePersonView } from "lemmy-js-client";

import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function purgePerson(item: AdminPurgePersonView): LogEntryData {
  return {
    icon: trashBin,
    title: "Purged User",
    by: item.admin ? getHandle(item.admin) : undefined,
    role: getAdminRole(item.admin),
    ...buildBaseData(item.admin_purge_person),
  };
}
