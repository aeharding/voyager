import { PostView } from "lemmy-js-client";
import React from "react";

interface ShareProps {
  share: React.MutableRefObject<(() => void) | null>;
  post: PostView;
}

export function Share({ share, post }: ShareProps) {
  React.useEffect(() => {
    share.current = share_internal;

    function share_internal() {
      navigator.share({ url: post.post.url ?? post.post.ap_id });
    }
  }, [share, post.post]);

  return <></>;
}
