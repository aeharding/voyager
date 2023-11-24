import { IonButton, IonIcon, useIonActionSheet } from "@ionic/react";
import {
  checkmarkCircleOutline,
  lockClosedOutline,
  lockOpenOutline,
  megaphoneOutline,
  trashOutline,
} from "ionicons/icons";
import { useAppDispatch } from "../../../store";
import { PostView } from "lemmy-js-client";
import { modRemovePost, modStickyPost, modLockPost } from "../postSlice";
import {
  buildLocked,
  buildStickied,
  postApproved,
  postRemoved,
} from "../../../helpers/toastMessages";
import { ActionButton } from "../actions/ActionButton";
import useAppToast from "../../../helpers/useAppToast";
import useCanModerate, {
  ModeratorRole,
  getModColor,
  getModIcon,
} from "../../moderation/useCanModerate";

interface MoreActionsProps {
  post: PostView;
  className?: string;
  onFeed?: boolean;
  solidIcon?: boolean;
}

export default function MoreModActions(props: MoreActionsProps) {
  const isMod = useCanModerate(props.post.community);

  if (!isMod) return;

  return <Actions {...props} role={isMod} />;
}

interface ActionsProps extends MoreActionsProps {
  role: ModeratorRole;
}

function Actions({ post, onFeed, solidIcon, className, role }: ActionsProps) {
  const [presentActionSheet] = useIonActionSheet();
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();

  function onClick() {
    presentActionSheet({
      cssClass: `${role} left-align-buttons`,
      buttons: [
        {
          text: "Approve",
          icon: checkmarkCircleOutline,
          handler: () => {
            (async () => {
              await dispatch(modRemovePost(post.post.id, false));

              presentToast(postApproved);
            })();
          },
        },
        {
          text: "Remove",
          icon: trashOutline,
          handler: () => {
            (async () => {
              await dispatch(modRemovePost(post.post.id, true));

              presentToast(postRemoved);
            })();
          },
        },
        {
          text: !post.post.featured_community ? "Sticky" : "Unsticky",
          icon: megaphoneOutline,
          handler: () => {
            (async () => {
              await dispatch(
                modStickyPost(post.post.id, !post.post.featured_community),
              );

              presentToast(buildStickied(!post.post.featured_community));
            })();
          },
        },
        {
          text: !post.post.locked ? "Lock" : "Unlock",
          icon: !post.post.locked ? lockClosedOutline : lockOpenOutline,
          handler: () => {
            (async () => {
              await dispatch(modLockPost(post.post.id, !post.post.locked));

              presentToast(buildLocked(!post.post.locked));
            })();
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });
  }

  const Button = onFeed ? ActionButton : IonButton;

  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={className}
      >
        <IonIcon icon={getModIcon(role, solidIcon)} color={getModColor(role)} />
      </Button>
    </>
  );
}
