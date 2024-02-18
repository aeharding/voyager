import { PostView } from "lemmy-js-client";
import { getCrosspostUrl } from "../../../helpers/lemmy";
import { useAppSelector } from "../../../store";
import { useMemo } from "react";

export default function useCrosspostUrl(post: PostView): string | undefined {
  const embedCrossposts = useAppSelector(
    (state) => state.settings.appearance.posts.embedCrossposts,
  );
  const crosspostUrl = useMemo(() => getCrosspostUrl(post.post), [post.post]);
  const object = useAppSelector((state) =>
    crosspostUrl ? state.resolve.objectByUrl[crosspostUrl] : undefined,
  );

  if (!embedCrossposts) return;
  if (crosspostUrl && object !== "couldnt_find_object") return crosspostUrl;
}
