import { ModlogItem } from "threadiverse";

export function getLogIndex(item: ModlogItem): string {
  return `${item.modlog.kind}-${item.modlog.id}`;
}
