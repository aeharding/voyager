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
    if (!("page" in pageData)) return [];

    const result = await db.getUserTagsPaginated(
      pageData.page,
      LIMIT,
      filter === "tagged",
    );

    // Reset removed state on refresh
    if (pageData.page === 1) setRemovedByHandle({});

    return result;
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
