import { arrowUndoCircle, trash } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { buildCommentLink } from "#/helpers/appLinkBuilder";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, buildCommentMessage } from "./shared";

export default function removeComment(item: ModlogItem): LogEntryData {
  const removed = !item.modlog.is_revert;
  return {
    icon: removed ? trash : arrowUndoCircle,
    title: `${removed ? "Removed" : "Restored"} Comment`,
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
