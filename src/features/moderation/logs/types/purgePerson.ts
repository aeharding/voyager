import { AdminPurgePersonView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";
import { trashBin } from "ionicons/icons";

export default function purgePerson(item: AdminPurgePersonView): LogEntryData {
  return {
    icon: trashBin,
    title: "Purged User",
    by: item.admin ? getHandle(item.admin) : undefined,
    ...buildBaseData(item.admin_purge_person),
  };
}
