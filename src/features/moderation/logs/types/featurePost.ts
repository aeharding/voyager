import { ModFeaturePostView } from "lemmy-js-client";
import { LogEntryData } from "../ModlogItem";
import { getHandle } from "../../../../helpers/lemmy";
import { buildBaseData, buildPostMessage } from "./shared";
import { buildPostLink } from "../../../../helpers/appLinkBuilder";
import { megaphone, volumeOff } from "ionicons/icons";

export default function featurePost(item: ModFeaturePostView): LogEntryData {
  return {
    icon: item.mod_feature_post.featured ? megaphone : volumeOff,
    title: `${item.mod_feature_post.featured ? "Stickied" : "Unstickied"} Post`,
    by: item.moderator ? getHandle(item.moderator) : undefined,
    message: buildPostMessage(item.post),
    link: buildPostLink(item.community, item.post),
    ...buildBaseData(item.mod_feature_post),
  };
}
