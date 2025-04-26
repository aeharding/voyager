import { PostView } from "lemmy-js-client";
import { CommentView } from "lemmy-js-client";

import useIsPostSelected from "./useIsPostSelected";

export default function useActivatedClass(item: PostView | CommentView) {
  const isActivated = useIsPostSelected(item);

  if (isActivated) return "app-activated";
}
