import {
  VgerCommentView,
  VgerCommunityView,
  VgerCreateComment,
  VgerCreatePost,
  VgerEditComment,
  VgerEditPost,
  VgerGetComments,
  VgerGetPost,
  VgerGetPosts,
  VgerPostView,
  VgerResolveObjectResponse,
  VgerSiteResponse,
} from "./types";

export interface VgerClientOptions {
  fetchFunction: typeof fetch;
  headers: Record<string, string>;
}

// Abstract base class that all clients should extend
export abstract class BaseVgerClient {
  public name: string;

  constructor(hostname: string, options: VgerClientOptions);

  abstract resolveObject(payload: {
    q: string;
  }): Promise<VgerResolveObjectResponse>;

  abstract getSite(): Promise<VgerSiteResponse>;

  abstract getCommunity(
    payload: VgerGetCommunity,
  ): Promise<{ community_view: VgerCommunityView }>;

  abstract getPosts(
    payload: VgerGetPosts,
  ): Promise<{ posts: VgerPostView[]; next_page?: string }>;

  abstract getComments(
    payload: VgerGetComments,
  ): Promise<{ comments: VgerCommentView[] }>;

  abstract getPost(payload: VgerGetPost): Promise<{ post_view: VgerPostView }>;

  abstract createPost(
    payload: VgerCreatePost,
  ): Promise<{ post_view: VgerPostView }>;

  abstract editPost(
    payload: VgerEditPost,
  ): Promise<{ post_view: VgerPostView }>;

  abstract createComment(
    payload: VgerCreateComment,
  ): Promise<{ comment_view: VgerCommentView }>;

  abstract editComment(
    payload: VgerEditComment,
  ): Promise<{ comment_view: VgerCommentView }>;

  abstract login(payload: {
    username_or_email: string;
    password: string;
    totp_2fa_token?: string;
  }): Promise<{ jwt?: string }>;
}
