import { CommentSortType } from "lemmy-js-client";

import { arrayOfAll } from "#/helpers/array";
import buildSort, { SortOptions } from "#/routes/pages/shared/Sort";

export type VgerCommentSortType = CommentSortType;

export const ALL_COMMENT_SORTS = arrayOfAll<VgerCommentSortType>()([
  "Hot",
  "Top",
  "New",
  "Controversial",
  "Old",
] as const satisfies SortOptions<VgerCommentSortType>);

export const { Sort: CommentSort, useSelectSort: useSelectCommentSort } =
  buildSort(ALL_COMMENT_SORTS);
