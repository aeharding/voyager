import { SortType } from "lemmy-js-client";
import { useState } from "react";
import { useAppSelector } from "../../store";

export default function usePostSort() {
  const defaultSort = useAppSelector(
    (state) => state.settings.general.posts.sort,
  );

  return useState<SortType>(defaultSort);
}
