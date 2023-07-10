import { IonNav } from "@ionic/react";
import { CommunityView } from "lemmy-js-client";
import NewPostRoot from "./NewPostRoot";
import { useCallback } from "react";

export type NewPostProps = {
  setCanDismiss: (canDismiss: boolean) => void;
  community: CommunityView | undefined;
  dismiss: () => void;
};

export default function NewPost(props: NewPostProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const root = useCallback(() => <NewPostRoot {...props} />, []);

  return <IonNav root={root} />;
}
