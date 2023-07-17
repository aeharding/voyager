import styled from "@emotion/styled";
import { PostView } from "lemmy-js-client";
import { getItemActorName } from "../../helpers/lemmy";
import { OPostBlurNsfw, PostBlurNsfwType } from "../../services/db";

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

export function isNsfw(post: PostView): boolean {
  if (post.post.nsfw || post.community.nsfw) return true;

  if (NSFW_INSTANCES.includes(getItemActorName(post.community))) return true;

  return false;
}

export function isNsfwBlurred(
  post: PostView,
  blurNsfw: PostBlurNsfwType
): boolean {
  if (blurNsfw === OPostBlurNsfw.Never) return false;

  return isNsfw(post);
}
