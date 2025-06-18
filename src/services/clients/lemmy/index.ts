import { LemmyHttp } from "lemmy-js-client";

import { getClient } from "#/services/lemmy";

import { BaseVgerClient } from "../vger";
import {
  compatLemmyCommentView,
  compatLemmyCommunityView,
  compatLemmyPostView,
} from "./compat";

export default class LemmyClient implements BaseVgerClient {
  name = "lemmy";
  private client: LemmyHttp;

  constructor(
    hostname: string,
    otherHeaders?: Record<string, string>,
    jwt?: string,
  ) {
    this.client = getClient(hostname, jwt);
  }

  async resolveObject(payload: Parameters<BaseVgerClient["resolveObject"]>[0]) {
    return this.client.resolveObject(payload);
  }

  async getSite() {
    const site = await this.client.getSite();

    return {
      ...site,
      site: site.site_view.site,
    };
  }

  async login(payload: Parameters<BaseVgerClient["login"]>[0]) {
    return this.client.login(payload);
  }

  async getCommunity(payload: Parameters<BaseVgerClient["getCommunity"]>[0]) {
    const response = await this.client.getCommunity(payload);

    return {
      community_view: compatLemmyCommunityView(response.community_view),
    };
  }

  async getPosts(payload: Parameters<BaseVgerClient["getPosts"]>[0]) {
    const response = await this.client.getPosts(payload);

    return {
      posts: response.posts.map(compatLemmyPostView),
    };
  }

  async getComments(payload: Parameters<BaseVgerClient["getComments"]>[0]) {
    const response = await this.client.getComments(payload);

    return {
      comments: response.comments.map(compatLemmyCommentView),
    };
  }

  async createPost(payload: Parameters<BaseVgerClient["createPost"]>[0]) {
    const response = await this.client.createPost(payload);

    return {
      post_view: compatLemmyPostView(response.post_view),
    };
  }

  async editPost(payload: Parameters<BaseVgerClient["editPost"]>[0]) {
    const response = await this.client.editPost(payload);

    return {
      post_view: compatLemmyPostView(response.post_view),
    };
  }

  async getPost(payload: Parameters<BaseVgerClient["getPost"]>[0]) {
    const response = await this.client.getPost(payload);

    return {
      post_view: compatLemmyPostView(response.post_view),
    };
  }

  async createComment(payload: Parameters<BaseVgerClient["createComment"]>[0]) {
    const response = await this.client.createComment(payload);

    return {
      comment_view: compatLemmyCommentView(response.comment_view),
    };
  }

  async editComment(payload: Parameters<BaseVgerClient["editComment"]>[0]) {
    const response = await this.client.editComment(payload);

    return {
      comment_view: compatLemmyCommentView(response.comment_view),
    };
  }
}
