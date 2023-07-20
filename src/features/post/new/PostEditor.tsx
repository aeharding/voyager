import { IonNav } from "@ionic/react";
import { CommunityView, PostView } from "lemmy-js-client";
import NewPostRoot from "./PostEditorRoot";
import { useCallback } from "react";

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const root = useCallback(() => <NewPostRoot {...props} />, []);

  return <IonNav root={root} />;
}
