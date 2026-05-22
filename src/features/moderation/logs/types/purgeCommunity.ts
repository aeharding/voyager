import { trashBin } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function purgeCommunity(item: ModlogItem): LogEntryData {
  return {
    icon: trashBin,
    title: "Purged Community",
    by: item.moderator,
    role: getAdminRole(item.moderator),
    ...buildBaseData(item.modlog),
  };
}
