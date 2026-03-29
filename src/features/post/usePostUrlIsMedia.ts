import { useMemo } from "react";
import { PostView } from "threadiverse";

import { isRedgif } from "#/features/media/external/redgifs/helpers";
import { findLoneImage } from "#/helpers/markdown";
import { findUrlMediaType } from "#/helpers/url";
import { useAppSelector } from "#/store";

type PostUrlMediaType = "from-url" | "from-body" | false;

export default function usePostUrlIsMedia(post: PostView) {
  const embedExternalMedia = useAppSelector(
    (state) => state.settings.appearance.posts.embedExternalMedia,
  );

  // React compiler:
  // eslint-disable-next-line react-hooks/exhaustive-deps
  function isPostUrlMedia(post: PostView): PostUrlMediaType {
    const url = post.post.url;

    if (!url) return false;

    if (findUrlMediaType(url, post.post.url_content_type)) {
      return "from-url";
    }

    if (embedExternalMedia) {
      if (isRedgif(url)) return "from-url";
    }

    if (!post.post.url && post.post.body && findLoneImage(post.post.body)) {
      return "from-body";
    }

    return false;
  }

  return useMemo(() => isPostUrlMedia(post), [post, isPostUrlMedia]);
}
