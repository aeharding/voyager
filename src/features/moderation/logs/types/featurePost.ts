import { megaphone, volumeOff } from "ionicons/icons";
import { ModlogItem } from "threadiverse";

import { buildPostLink } from "#/helpers/appLinkBuilder";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, buildPostMessage } from "./shared";

export default function featurePost(item: ModlogItem): LogEntryData {
  const featured = !item.modlog.is_revert;
  const scope = item.modlog.kind === "admin_feature_post_site" ? " (Site)" : "";
  return {
    icon: featured ? megaphone : volumeOff,
    title: `${featured ? "Stickied" : "Unstickied"} Post${scope}`,
    by: item.moderator,
    message: item.target_post ? buildPostMessage(item.target_post) : undefined,
    link:
      item.target_community && item.target_post
        ? buildPostLink(item.target_community, item.target_post)
        : undefined,
    ...buildBaseData(item.modlog),
  };
}
