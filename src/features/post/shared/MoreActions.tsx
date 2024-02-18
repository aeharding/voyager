import { useContext } from "react";
import { InFeedContext } from "../../feed/Feed";
import { ActionButton } from "../actions/ActionButton";
import { IonButton, IonIcon } from "@ionic/react";
import usePostActions from "./usePostActions";
import { ellipsisHorizontal } from "ionicons/icons";
import { PostView } from "lemmy-js-client";

interface MoreActionsProps {
  post: PostView;
  className?: string;
}

export default function MoreActions({ post, className }: MoreActionsProps) {
  const inFeed = useContext(InFeedContext);
  const Button = inFeed ? ActionButton : IonButton;
  const openPostActions = usePostActions(post);

  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          openPostActions();
        }}
        className={className}
      >
        <IonIcon icon={ellipsisHorizontal} />
      </Button>
    </>
  );
}
