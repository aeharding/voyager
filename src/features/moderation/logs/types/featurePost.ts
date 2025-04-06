import { megaphone, volumeOff } from "ionicons/icons";
import { ModFeaturePostView } from "lemmy-js-client";

import { buildPostLink } from "#/helpers/appLinkBuilder";

import { LogEntryData } from "../ModlogItem";
import { buildBaseData, buildPostMessage } from "./shared";

export default function featurePost(item: ModFeaturePostView): LogEntryData {
  return {
    icon: item.mod_feature_post.featured ? megaphone : volumeOff,
    title: `${item.mod_feature_post.featured ? "Stickied" : "Unstickied"} Post`,
    by: item.moderator,
    message: buildPostMessage(item.post),
    link: buildPostLink(item.community, item.post),
    ...buildBaseData(item.mod_feature_post),
  };
}
