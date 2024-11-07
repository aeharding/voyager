import { useCallback } from "react";
import { useAppSelector } from "../../store";
import { PostView } from "lemmy-js-client";
import { isRedgif } from "../media/external/redgifs/helpers";
import { findUrlMediaType } from "../../helpers/url";

export default function useIsPostUrlMedia() {
  const embedExternalMedia = useAppSelector(
    (state) => state.settings.appearance.posts.embedExternalMedia,
  );

  return useCallback(
    (post: PostView) => {
      const url = post.post.url;

      if (!url) return false;

      if (embedExternalMedia) {
        if (isRedgif(url)) return true;
      }

      return !!findUrlMediaType(url, post.post.url_content_type);
    },
    [embedExternalMedia],
  );
}
