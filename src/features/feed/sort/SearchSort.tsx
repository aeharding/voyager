import buildSort from "#/routes/pages/shared/Sort";
import { SortOptions } from "#/routes/pages/shared/Sort";

export type SearchSortType = "Top" | "Old" | "New";

export const SEARCH_SORTS = ["Top", "Old", "New"] as const;

const sortOptions: SortOptions<SearchSortType> = SEARCH_SORTS;

export const { Sort: SearchSort, useSelectSort: useSelectSearchSort } =
  buildSort(sortOptions);
