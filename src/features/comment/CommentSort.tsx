import buildSort, { FlattenSortOptions } from "#/routes/pages/shared/Sort";

export const COMMENT_SORT_BY_MODE = {
  lemmyv0: ["Hot", "Top", "New", "Controversial", "Old"],
  lemmyv1: ["Hot", "Top", "New", "Controversial", "Old"],
  piefed: ["Hot", "Top", "New", "Old"],
} as const;

export type VgerCommentSortTypeByMode = {
  [K in keyof typeof COMMENT_SORT_BY_MODE]: FlattenSortOptions<
    (typeof COMMENT_SORT_BY_MODE)[K]
  >[number];
};

export type VgerCommentSortType =
  VgerCommentSortTypeByMode[keyof VgerCommentSortTypeByMode];

export const {
  Sort: CommentSort,
  useSelectSort: useSelectCommentSort,
  formatSort: formatCommentSort,
} = buildSort(COMMENT_SORT_BY_MODE);
