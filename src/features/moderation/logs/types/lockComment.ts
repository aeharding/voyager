import { lockClosed, lockOpen } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { buildCommentLink } from "#/helpers/appLinkBuilder";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, buildCommentMessage } from "./shared";

export default function lockComment(item: ModlogItem): LogEntryData {
  const locked = !item.modlog.is_revert;
  return {
    icon: locked ? lockClosed : lockOpen,
    title: `${locked ? "Locked" : "Unlocked"} Comment`,
    by: item.moderator,
    message: item.target_comment
      ? buildCommentMessage(item.target_comment)
      : undefined,
    link:
      item.target_community && item.target_comment
        ? buildCommentLink(item.target_community, item.target_comment)
        : undefined,
    ...buildBaseData(item.modlog),
  };
}
