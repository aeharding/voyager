import { useState } from "react";

import Feed, { FetchFn } from "#/features/feed/Feed";
import { removeTag } from "#/features/tags/userTagSlice";
import { db, UserTag as UserTagType } from "#/services/db";
import { LIMIT } from "#/services/lemmy";
import { useAppDispatch } from "#/store";

import BrowseTag from "./BrowseTag";

interface BrowseTagsProps {
  filter: "all" | "tagged";
}

export default function BrowseTags({ filter }: BrowseTagsProps) {
  const dispatch = useAppDispatch();
  const [removedByHandle, setRemovedByHandle] = useState<Record<string, true>>(
    {},
  );

  const fetchFn: FetchFn<UserTagType> = async (pageData) => {
    if (typeof pageData.page_cursor === "string")
      throw new Error("Invalid page data");

    const page = pageData.page_cursor ?? 0;

    const data = await db.getUserTagsPaginated(
      page,
      LIMIT,
      filter === "tagged",
    );

    // Reset removed state on refresh
    if (!pageData.page_cursor) setRemovedByHandle({});

    return { data, next_page: page + 1 };
  };

  function filterFn(tag: UserTagType) {
    return !removedByHandle[tag.handle];
  }

  function onRemove(tag: UserTagType) {
    dispatch(removeTag(tag));
    setRemovedByHandle((prev) => ({ ...prev, [tag.handle]: true }));
  }

  return (
    <Feed
      renderItemContent={(item) => <BrowseTag tag={item} remove={onRemove} />}
      fetchFn={fetchFn}
      getIndex={(item) => item.handle}
      filterFn={filterFn}
    />
  );
}
