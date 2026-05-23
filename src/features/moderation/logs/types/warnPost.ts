import { warningOutline } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { buildPostLink } from "#/helpers/appLinkBuilder";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, buildPostMessage } from "./shared";

export default function warnPost(item: ModlogItem): LogEntryData {
  return {
    icon: warningOutline,
    title: "Warned Post",
    by: item.moderator,
    message: item.target_post ? buildPostMessage(item.target_post) : undefined,
    link:
      item.target_community && item.target_post
        ? buildPostLink(item.target_community, item.target_post)
        : undefined,
    ...buildBaseData(item.modlog),
  };
}
