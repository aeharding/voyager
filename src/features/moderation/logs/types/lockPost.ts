import { lockClosed, lockOpen } from "ionicons/icons";
import { ModLockPostView } from "lemmy-js-client";

import { buildPostLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, buildPostMessage } from "./shared";

export default function lockPost(item: ModLockPostView): LogEntryData {
  return {
    icon: item.mod_lock_post.locked ? lockClosed : lockOpen,
    title: `${item.mod_lock_post.locked ? "Locked" : "Unlocked"} Post`,
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message: buildPostMessage(item.post),
    link: buildPostLink(item.community, item.post),
    ...buildBaseData(item.mod_lock_post),
  };
}
