import { GetPosts } from "lemmy-js-client";

import { handleSelector } from "#/features/auth/authSelectors";
import { useAppSelector } from "#/store";

export default function useCommonPostFeedParams():
  | Pick<GetPosts, "show_nsfw">
  | undefined {
  const handle = useAppSelector(handleSelector);

  if (handle === "lemmynsfw.com") return { show_nsfw: true };
}
