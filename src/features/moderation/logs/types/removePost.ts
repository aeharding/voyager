import { ModRemovePostView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData, buildPostMessage } from "./shared";
import { buildPostLink } from "../../../../helpers/appLinkBuilder";

export default function removePost(item: ModRemovePostView): LogEntryData {
  return {
    title: `${item.mod_remove_post.removed ? "Removed" : "Restored"} Post`,
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message: buildPostMessage(item.post),
    link: buildPostLink(item.community, item.post),
    ...buildBaseData(item.mod_remove_post),
  };
}
