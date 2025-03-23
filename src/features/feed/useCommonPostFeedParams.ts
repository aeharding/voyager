import { GetPosts } from "lemmy-js-client";

import { handleSelector } from "#/features/auth/authSelectors";
import { useAppSelector } from "#/store";

export default function useCommonPostFeedParams(): Pick<GetPosts, "show_nsfw"> {
  const handle = useAppSelector(handleSelector);

  return {
    show_nsfw: handle === "lemmynsfw.com" ? true : undefined,
  };
}
