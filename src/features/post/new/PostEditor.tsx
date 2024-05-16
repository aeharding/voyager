import { IonNav } from "@ionic/react";
import { CommunityView, PostView } from "lemmy-js-client";
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
  return <IonNav root={() => <PostEditorRoot {...props} />} />;
}
