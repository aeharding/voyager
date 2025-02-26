import { arrowUndoCircle, trash } from "ionicons/icons";
import { ModRemoveCommentView } from "lemmy-js-client";

import { buildCommentLink } from "#/helpers/appLinkBuilder";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, buildCommentMessage } from "./shared";

export default function removeComment(
  item: ModRemoveCommentView,
): LogEntryData {
  return {
    icon: item.mod_remove_comment.removed ? trash : arrowUndoCircle,
    title: `${
      item.mod_remove_comment.removed ? "Removed" : "Restored"
    } Comment`,
    by: item.moderator,
    message: buildCommentMessage(item.comment),
    link: buildCommentLink(item.community, item.comment),
    ...buildBaseData(item.mod_remove_comment),
  };
}
