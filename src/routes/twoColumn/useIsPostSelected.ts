import { CommentView } from "lemmy-js-client";
import { PostView } from "lemmy-js-client";
import { use } from "react";

import { useTabName } from "#/core/TabContext";
import { isPost } from "#/helpers/lemmy";

import { OutletContext } from "../Outlet";

export default function useIsPostSelected(item: PostView | CommentView) {
  const { postDetailDictionary } = use(OutletContext);
  const tabName = useTabName();

  if (!tabName || !postDetailDictionary) return false;

  const currentItemId = postDetailDictionary[tabName];

  if (!currentItemId) return false;

  const potentialPath = isPost(item) ? undefined : item.comment.path;

  return (
    postDetailDictionary[tabName]?.id === `${item.post.id}` &&
    postDetailDictionary[tabName]?.commentPath === potentialPath
  );
}
