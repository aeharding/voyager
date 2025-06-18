export interface VgerPost {
  id: number;
  name: string;
  /**
   * An optional link / url for the post.
   */
  url?: string;
  /**
   * An optional post body, in markdown.
   */
  body?: string;
  creator_id: PersonId;
  community_id: CommunityId;
  /**
   * Whether the post is removed.
   */
  removed: boolean;
  /**
   * Whether the post is locked.
   */
  locked: boolean;
  published: string;
  updated?: string;
  /**
   * Whether the post is deleted.
   */
  deleted: boolean;
  /**
   * Whether the post is NSFW.
   */
  nsfw: boolean;
  /**
   * A title for the link.
   */
  embed_title?: string;
  /**
   * A description for the link.
   */
  embed_description?: string;
  /**
   * A thumbnail picture url.
   */
  thumbnail_url?: string;
  /**
   * The federated activity id / ap_id.
   */
  ap_id: string;
  /**
   * Whether the post is local.
   */
  local: boolean;

  language_id: number;
  /**
   * Whether the post is featured to its community.
   */
  featured_community: boolean;
  /**
   * Whether the post is featured to its site.
   */
  featured_local: boolean;
  url_content_type?: string;
  /**
   * An optional alt_text, usable for image posts.
   */
  alt_text?: string;
}
