import { trashBin } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, getAdminRole } from "./shared";

export default function purgePost(item: ModlogItem): LogEntryData {
  return {
    icon: trashBin,
    title: "Purged Post",
    by: item.moderator,
    role: getAdminRole(item.moderator),
    ...buildBaseData(item.modlog),
  };
}
