import { lockClosed, lockOpen } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { buildPostLink } from "#/helpers/appLinkBuilder";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, buildPostMessage } from "./shared";

export default function lockPost(item: ModlogItem): LogEntryData {
  const locked = !item.modlog.is_revert;
  return {
    icon: locked ? lockClosed : lockOpen,
    title: `${locked ? "Locked" : "Unlocked"} Post`,
    by: item.moderator,
    message: item.target_post ? buildPostMessage(item.target_post) : undefined,
    link:
      item.target_community && item.target_post
        ? buildPostLink(item.target_community, item.target_post)
        : undefined,
    ...buildBaseData(item.modlog),
  };
}
