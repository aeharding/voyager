import {
  CommentView,
  CommunityView,
  CreatePost,
  EditPost,
  LemmyHttp,
  Person,
  PostView,
} from "lemmy-js-client";

import type PiefedClient from "./clients/piefed";
import { components } from "./clients/piefed/schema";

type AbstractClient = LemmyHttp | PiefedClient;

export type VoyagerCommunity = Awaited<
  ReturnType<AbstractClient["getCommunity"]>
>;

export type VgerPerson = Person | components["schemas"]["Person"];

export type VgerPostView = PostView | components["schemas"]["PostView"];

export type VgerPost = VgerPostView["post"];

export type VgerCommentView =
  | CommentView
  | components["schemas"]["CommentView"];

export type VgerComment = VgerCommentView["comment"];

export type VgerCommunityView =
  | CommunityView
  | components["schemas"]["CommunityView"];

export type VgerCommunity = VgerCommunityView["community"];

export type VgerCreatePost = CreatePost | components["schemas"]["CreatePost"];
export type VgerEditPost = EditPost | components["schemas"]["EditPost"];
