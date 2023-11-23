import { ModRemoveCommentView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData, buildCommentMessage } from "./shared";
import { buildCommentLink } from "../../../../helpers/appLinkBuilder";

export default function removeComment(
  item: ModRemoveCommentView,
): LogEntryData {
  return {
    title: `${
      item.mod_remove_comment.removed ? "Removed" : "Restored"
    } Comment`,
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message: buildCommentMessage(item.comment),
    link: buildCommentLink(item.community, item.comment),
    ...buildBaseData(item.mod_remove_comment),
  };
}
