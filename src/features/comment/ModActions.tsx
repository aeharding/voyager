import { IonIcon, IonLoading } from "@ionic/react";
import { CommentView } from "lemmy-js-client";

import {
  getModColor,
  getModIcon,
  ModeratorRole,
} from "#/features/moderation/useCanModerate";
import useCommentModActions from "#/features/moderation/useCommentModActions";
import { ActionButton } from "#/features/post/actions/ActionButton";

interface ModActionsProps {
  comment: CommentView;
  role: ModeratorRole;
}

export default function ModActions({ comment, role }: ModActionsProps) {
  const { loading, present } = useCommentModActions(comment);

  return (
    <>
      <ActionButton>
        <IonIcon
          icon={getModIcon(role, true)}
          color={getModColor(role)}
          onClick={(e) => {
            e.stopPropagation();
            present();
          }}
        />
      </ActionButton>

      <IonLoading isOpen={loading} message="Nuking..." />
    </>
  );
}
