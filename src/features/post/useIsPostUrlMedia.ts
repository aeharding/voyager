import { PostView } from "lemmy-js-client";
import { useCallback } from "react";

import { isRedgif } from "#/features/media/external/redgifs/helpers";
import { findUrlMediaType } from "#/helpers/url";
import { useAppSelector } from "#/store";

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

      return !!findUrlMediaType(url);
    },
    [embedExternalMedia],
  );
}
