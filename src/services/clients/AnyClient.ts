import { resolveSoftware } from "#/services/wellknown";

import LemmyClient from "./lemmy";
import PiefedClient from "./piefed";
import { BaseVgerClient, VgerClientOptions } from "./vger";

// Global cache for software discovery promises by hostname
const discoveryCache = new Map<string, Promise<string>>();

export default class AnyClient implements BaseVgerClient {
  name = "unknown";
  private hostname: string;
  private options: VgerClientOptions;
  private discoveredSoftware: string | null = null;
  private delegateClient: BaseVgerClient | null = null;

  constructor(hostname: string, options: VgerClientOptions) {
    this.hostname = hostname;
    this.options = options;
  }

  private async ensureClient(): Promise<BaseVgerClient> {
    if (this.delegateClient) {
      return this.delegateClient;
    }

    if (!this.discoveredSoftware) {
      if (!discoveryCache.has(this.hostname)) {
        discoveryCache.set(
          this.hostname,
          resolveSoftware(this.hostname).then((software) => software.name),
        );
      }
      this.discoveredSoftware = await discoveryCache.get(this.hostname)!;
    }

    // Create the appropriate client based on discovered software
    if (this.discoveredSoftware === "lemmy") {
      this.delegateClient = new LemmyClient(this.hostname, this.options);
    } else if (this.discoveredSoftware === "piefed") {
      this.delegateClient = new PiefedClient(this.hostname, this.options);
    } else {
      throw new Error(`Unsupported software: ${this.discoveredSoftware}`);
    }

    return this.delegateClient;
  }

  async resolveObject(payload: Parameters<BaseVgerClient["resolveObject"]>[0]) {
    const client = await this.ensureClient();
    return client.resolveObject(payload);
  }

  async getSite() {
    const client = await this.ensureClient();
    return client.getSite();
  }

  async getCommunity(payload: Parameters<BaseVgerClient["getCommunity"]>[0]) {
    const client = await this.ensureClient();
    return client.getCommunity(payload);
  }

  async getPosts(payload: Parameters<BaseVgerClient["getPosts"]>[0]) {
    const client = await this.ensureClient();
    return client.getPosts(payload);
  }

  async getComments(payload: Parameters<BaseVgerClient["getComments"]>[0]) {
    const client = await this.ensureClient();
    return client.getComments(payload);
  }

  async getPost(payload: Parameters<BaseVgerClient["getPost"]>[0]) {
    const client = await this.ensureClient();
    return client.getPost(payload);
  }

  async createPost(payload: Parameters<BaseVgerClient["createPost"]>[0]) {
    const client = await this.ensureClient();
    return client.createPost(payload);
  }

  async editPost(payload: Parameters<BaseVgerClient["editPost"]>[0]) {
    const client = await this.ensureClient();
    return client.editPost(payload);
  }

  async createComment(payload: Parameters<BaseVgerClient["createComment"]>[0]) {
    const client = await this.ensureClient();
    return client.createComment(payload);
  }

  async editComment(payload: Parameters<BaseVgerClient["editComment"]>[0]) {
    const client = await this.ensureClient();
    return client.editComment(payload);
  }

  async login(payload: Parameters<BaseVgerClient["login"]>[0]) {
    const client = await this.ensureClient();
    return client.login(payload);
  }
}
