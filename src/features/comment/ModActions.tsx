import { IonIcon, IonLoading } from "@ionic/react";
import { CommentView } from "lemmy-js-client";
import {
  ModeratorRole,
  getModColor,
  getModIcon,
} from "../moderation/useCanModerate";
import useCommentModActions from "../moderation/useCommentModActions";

interface ModActionsProps {
  comment: CommentView;
  role: ModeratorRole;
}

export default function ModActions({ comment, role }: ModActionsProps) {
  const { loading, present } = useCommentModActions(comment);

  return (
    <>
      <IonIcon
        icon={getModIcon(role, true)}
        color={getModColor(role)}
        onClick={(e) => {
          e.stopPropagation();
          present();
        }}
      />

      <IonLoading isOpen={loading} message="Nuking..." />
    </>
  );
}
