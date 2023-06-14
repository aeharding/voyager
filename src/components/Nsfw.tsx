import styled from "@emotion/styled";
import { PostView } from "lemmy-js-client";
import { getItemActorName } from "../helpers/lemmy";

const Container = styled.span`
  font-size: 0.8em;
  padding: 2px 4px;
  border-radius: 8px;
  margin-left: 4px;
  background: var(--ion-color-danger);
`;

export default function Nsfw() {
  return <Container>NSFW</Container>;
}

const NSFW_INSTANCES = ["lemmynsfw.com"];

export function isNsfw(post: PostView): boolean {
  if (post.post.nsfw) return true;

  if (NSFW_INSTANCES.includes(getItemActorName(post.community))) return true;

  return false;
}
