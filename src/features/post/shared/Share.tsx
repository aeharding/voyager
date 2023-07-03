import { useIonToast } from "@ionic/react";
import { PostView } from "lemmy-js-client";
import React from "react";

interface ShareProps {
  share: React.MutableRefObject<(() => void) | null>;
  post: PostView;
}

export function Share({ share, post }: ShareProps) {
  const [present] = useIonToast();

  React.useEffect(() => {
    share.current = share_internal;

    function share_internal() {
      copy_to_clipboard();
    }

    function copy_to_clipboard() {
      const share_text = post.post.url ?? post.post.ap_id;
      if (!share_text) {
        console.error("This should never happen");
        return;
      }

      if (navigator.share !== undefined) {
        // normal case for mobile
        navigator.share({ url: share_text });
      } else if (navigator.clipboard !== undefined) {
        // desktop or other platforms that do not provide sharing
        navigator.clipboard.writeText(share_text).then(
          () => {
            present({
              message: "Copied to clipboard: " + share_text,
              duration: 1000,
              position: "top",
              color: "primary",
            });
          },
          () => {
            // clipboard write failed
            console.error("Could not write to clipboard");
          }
        );
      } else {
        console.error("Could not find clipboard");
      }
    }
  }, [share, post.post, present]);

  return <></>;
}
