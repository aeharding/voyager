import { IonActionSheet, useIonToast } from "@ionic/react";
import { image, linkOutline, videocamOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import React, { useState } from "react";
import { isUrlImage, isUrlVideo } from "../../../helpers/lemmy";

type ShareType = "Post" | "Post content";

interface ShareProps {
  share: React.MutableRefObject<(() => void) | null>;
  post: PostView;
}

export function Share({ share, post }: ShareProps) {
  const [open, setOpen] = useState(false);
  const [present] = useIonToast();

  const callback_clipboard_copy = React.useCallback(copy_to_clipboard, [
    post.post,
    present,
  ]);
  React.useEffect(() => {
    share.current = share_with_modal;

    function share_with_modal() {
      if (post.post.url !== undefined) {
        // we give the option to share the url in the post itself, if there is one
        setOpen(true);
      } else {
        // otherwise just copy to post url
        callback_clipboard_copy("Post");
      }
    }
  }, [share, post.post, callback_clipboard_copy]);

  function copy_to_clipboard(mode: ShareType) {
    const share_text =
      mode === "Post content" ? post.post.url ?? "" : post.post.ap_id;
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

  const icon = post.post.url
    ? isUrlImage(post.post.url)
      ? image
      : isUrlVideo(post.post.url)
      ? videocamOutline
      : linkOutline
    : linkOutline;

  return (
    <IonActionSheet
      cssClass="left-align-buttons"
      isOpen={open}
      onClick={(e) => e.stopPropagation()}
      onDidDismiss={() => setOpen(false)}
      onWillDismiss={(e) => {
        if (e.detail.data === "Post" || e.detail.data === "Post content") {
          copy_to_clipboard(e.detail.data);
        }
      }}
      header="Share..."
      buttons={[
        { text: "Post", data: "Post", icon: linkOutline },
        { text: "Post content", data: "Post content", icon: icon },
        { text: "Cancel", role: "cancel" },
      ]}
    />
  );
}
