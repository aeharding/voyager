import { AdminPurgePostView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";

export default function purgePost(item: AdminPurgePostView): LogEntryData {
  return {
    title: "Purged Post",
    by: item.admin ? getHandle(item.admin) : undefined,
    ...buildBaseData(item.admin_purge_post),
  };
}
