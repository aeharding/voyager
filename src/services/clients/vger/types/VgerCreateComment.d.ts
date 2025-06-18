export interface VgerCreateComment {
  content: string;
  post_id: number;
  parent_id?: number;
  language_id?: number;
}
