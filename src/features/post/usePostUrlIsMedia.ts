import { PostView } from "threadiverse";

import { isRedgif } from "#/features/media/external/redgifs/helpers";
import { findLoneImage } from "#/helpers/markdown";
import { findUrlMediaType } from "#/helpers/url";
import { useAppSelector } from "#/store";

export default function usePostUrlIsMedia(post: PostView) {
  const embedExternalMedia = useAppSelector(
    (state) => state.settings.appearance.posts.embedExternalMedia,
  );

  const { url, url_content_type, body } = post.post;

  if (url) {
    if (findUrlMediaType(url, url_content_type)) {
      return "from-url";
    }

    if (embedExternalMedia) {
      if (isRedgif(url)) return "from-url";
    }
  } else {
    if (body && findLoneImage(body)) return "from-body";
  }

  return false;
}
