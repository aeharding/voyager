import { arrowUndoCircle, trash } from "ionicons/icons";
import { ModRemovePostView } from "lemmy-js-client";

import { buildPostLink } from "#/helpers/appLinkBuilder";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, buildPostMessage } from "./shared";

export default function removePost(item: ModRemovePostView): LogEntryData {
  return {
    icon: item.mod_remove_post.removed ? trash : arrowUndoCircle,
    title: `${item.mod_remove_post.removed ? "Removed" : "Restored"} Post`,
    by: item.moderator,
    message: buildPostMessage(item.post),
    link: buildPostLink(item.community, item.post),
    ...buildBaseData(item.mod_remove_post),
  };
}
