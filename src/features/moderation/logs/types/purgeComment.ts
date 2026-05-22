import { trashBin } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function purgeComment(item: ModlogItem): LogEntryData {
  return {
    icon: trashBin,
    title: "Purged Comment",
    by: item.moderator,
    role: getAdminRole(item.moderator),
    ...buildBaseData(item.modlog),
  };
}
