export interface VgerCreatePost {
  name: string;
  community_id: number;
  url?: string;
  /**
   * An optional body for the post in markdown.
   */
  body?: string;
  /**
   * An optional alt_text, usable for image posts.
   */
  alt_text?: string;
  nsfw?: boolean;
  language_id?: LanguageId;
  /**
   * Instead of fetching a thumbnail, use a custom one.
   */
  custom_thumbnail?: string;
}
