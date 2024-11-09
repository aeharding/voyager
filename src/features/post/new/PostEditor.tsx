import { IonNav } from "@ionic/react";
import { CommunityView, PostView } from "lemmy-js-client";
import { useState } from "react";

import PostEditorRoot from "./PostEditorRoot";

export type PostEditorProps = {
  setCanDismiss: (canDismiss: boolean) => void;
  dismiss: () => void;
} & (
  | {
      community: CommunityView | undefined;
    }
  | {
      existingPost: PostView;
    }
);

export default function PostEditor(props: PostEditorProps) {
  const [root] = useState(
    () =>
      function render() {
        return <PostEditorRoot {...props} />;
      },
  );

  return <IonNav root={root} />;
}
