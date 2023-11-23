import { AdminPurgePersonView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";

export default function purgePerson(item: AdminPurgePersonView): LogEntryData {
  return {
    title: "Purged User",
    by: item.admin ? getHandle(item.admin) : undefined,
    ...buildBaseData(item.admin_purge_person),
  };
}
