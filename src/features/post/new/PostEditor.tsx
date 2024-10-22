import { IonNav } from "@ionic/react";
import { CommunityView, PostView } from "lemmy-js-client";
import PostEditorRoot from "./PostEditorRoot";
import useEvent from "../../../helpers/useEvent";

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
  const root = useEvent(() => <PostEditorRoot {...props} />);

  return <IonNav root={root} />;
}
