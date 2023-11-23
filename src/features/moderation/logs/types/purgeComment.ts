import { AdminPurgeCommentView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData } from "./shared";

export default function purgeComment(
  item: AdminPurgeCommentView,
): LogEntryData {
  return {
    title: "Purged Comment",
    by: item.admin ? getHandle(item.admin) : undefined,
    ...buildBaseData(item.admin_purge_comment),
  };
}
