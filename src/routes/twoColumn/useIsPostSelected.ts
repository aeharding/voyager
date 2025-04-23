import { use } from "react";

import { useTabName } from "#/core/TabContext";

import { OutletContext } from "../Outlet";

export default function useIsPostSelected(postId: number | undefined) {
  const { postDetailDictionary } = use(OutletContext);
  const tabName = useTabName();

  if (!tabName || !postDetailDictionary) return false;

  return postDetailDictionary[tabName]?.id === `${postId}`;
}
