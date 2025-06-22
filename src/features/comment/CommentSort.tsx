import { arrayOfAll } from "#/helpers/array";
import buildSort, {
  SortOptions,
  SortOptionsByMode,
} from "#/routes/pages/shared/Sort";

export type VgerCommentSortType =
  | "Hot"
  | "Top"
  | "New"
  | "Controversial"
  | "Old";

export const COMMENT_SORT_BY_MODE = {
  lemmyv0: ["Hot", "Top", "New", "Controversial", "Old"],
  lemmyv1: ["Hot", "Top", "New", "Controversial", "Old"],
  piefed: ["Hot", "Top", "New", "Old"],
} as const satisfies SortOptionsByMode<VgerCommentSortType>;

export const ALL_COMMENT_SORTS = arrayOfAll<VgerCommentSortType>()([
  "Hot",
  "Top",
  "New",
  "Controversial",
  "Old",
] as const satisfies SortOptions<VgerCommentSortType>);

export const { Sort: CommentSort, useSelectSort: useSelectCommentSort } =
  buildSort(COMMENT_SORT_BY_MODE);
