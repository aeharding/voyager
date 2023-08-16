import styled from "@emotion/styled";
import { Community, PostView } from "lemmy-js-client";
import { getItemActorName } from "../../helpers/lemmy";
import { OPostBlurNsfw, PostBlurNsfwType } from "../../services/db";
import { PostContext } from "../../helpers/postContext";

const Container = styled.span`
  font-size: 0.8rem;
  vertical-align: middle;
  padding: 2px 4px;
  border-radius: 8px;
  margin-left: 4px;
  background: #ff0000;
  background: color(display-p3 1 0 0);
  color: white;
`;

export default function Nsfw() {
  return <Container>NSFW</Container>;
}

const NSFW_INSTANCES = ["lemmynsfw.com"];

/**
 * Whether a post is NSFW; directly, by it's community, or by its instance
 */
export function isNsfw(post: PostView): boolean {
  if (post.post.nsfw) return true;

  if (isNsfwCommunity(post.community)) return true;

  return false;
}

/**
 * Whether a community is marked NSFW
 */
export function isNsfwCommunity(community: Community): boolean {
  if (community.nsfw) return true;

  if (NSFW_INSTANCES.includes(getItemActorName(community))) return true;

  return false;
}

/**
 * Whether a feed is marked NSFW
 */
export function isNsfwFeed(postContext: PostContext, post: PostView): boolean {
  if (postContext === "CommunityFeed") return isNsfwCommunity(post.community);

  return false;
}

/**
 * Whether a post should be blurred
 * @param post
 * @param blurNsfw
 * @returns
 */
export function isNsfwBlurred(
  post: PostView,
  postContext: PostContext,
  blurNsfw: PostBlurNsfwType,
): boolean {
  if (postContext === "Post") return false;
  if (blurNsfw === OPostBlurNsfw.Never) return false;

  if (blurNsfw === OPostBlurNsfw.SfwFeeds)
    return isNsfw(post) && !isNsfwFeed(postContext, post);

  return isNsfw(post);
}
