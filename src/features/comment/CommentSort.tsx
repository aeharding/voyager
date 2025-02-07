import buildSort from "#/routes/pages/shared/Sort";

export const COMMENT_SORTS = [
  "Hot",
  "Top",
  "New",
  "Controversial",
  "Old",
] as const;

export const { Sort: CommentSort, useSelectSort: useSelectCommentSort } =
  buildSort(COMMENT_SORTS);
