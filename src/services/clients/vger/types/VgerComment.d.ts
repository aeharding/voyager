export interface VgerComment {
  id: number;
  creator_id: number;
  post_id: number;
  content: string;
  /**
   * Whether the comment has been removed.
   */
  removed: boolean;
  published: string;
  updated?: string;
  /**
   * Whether the comment has been deleted by its creator.
   */
  deleted: boolean;
  /**
   * The federated activity id / ap_id.
   */
  ap_id: string;
  /**
   * Whether the comment is local.
   */
  local: boolean;
  /**
   * The path / tree location of a comment, separated by dots, ending with the comment's id. Ex:
   * 0.24.27
   */
  path: string;
  /**
   * Whether the comment has been distinguished(speaking officially) by a mod.
   */
  distinguished: boolean;
  language_id: number;
}
