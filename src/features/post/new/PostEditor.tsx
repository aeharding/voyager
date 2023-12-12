import { IonNav } from "@ionic/react";
import { Community, PostView } from "lemmy-js-client";
import PostEditorRoot from "./PostEditorRoot";
import { useCallback } from "react";

export type PostEditorProps = {
  setCanDismiss: (canDismiss: boolean) => void;
  dismiss: () => void;
} & {
  community: Community | undefined;
  existingPost: PostView | undefined;
};

export default function PostEditor(props: PostEditorProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const root = useCallback(() => <PostEditorRoot {...props} />, []);

  return <IonNav root={root} />;
}
