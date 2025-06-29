import { IonNav } from "@ionic/react";
import { useRef, useState } from "react";
import { CommunityView, PostView } from "threadiverse";

import useIonNavBackButtonListener from "#/helpers/useIonNavBackButtonListener";

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

  const navRef = useRef<HTMLIonNavElement>(null);

  useIonNavBackButtonListener(navRef);

  return <IonNav root={root} ref={navRef} />;
}
