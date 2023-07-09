import {
  IonActionSheet,
  IonButton,
  IonIcon,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import {
  ellipsisHorizontal,
  mailOutline,
  removeCircleOutline,
} from "ionicons/icons";
import { useMemo, useState } from "react";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { useAppDispatch, useAppSelector } from "../../store";
import { blockUser } from "./userSlice";
import { getHandle } from "../../helpers/lemmy";
import { buildBlocked, problemBlockingUser } from "../../helpers/toastMessages";

interface UserPageActionsProps {
  handle: string;
}

export default function UserPageActions({ handle }: UserPageActionsProps) {
  const [open, setOpen] = useState(false);
  const [present] = useIonToast();
  const router = useIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const blocks = useAppSelector(
    (state) => state.auth.site?.my_user?.person_blocks
  );
  const isBlocked = useMemo(
    () => blocks?.some((b) => getHandle(b.target) === handle),
    [blocks, handle]
  );
  const userByHandle = useAppSelector((state) => state.user.userByHandle);
  const user = userByHandle[handle];

  return (
    <>
      <IonButton
        disabled={!handle}
        fill="default"
        onClick={() => setOpen(true)}
      >
        <IonIcon icon={ellipsisHorizontal} color="primary" />
      </IonButton>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        buttons={[
          {
            text: "Send Message",
            data: "message",
            icon: mailOutline,
          },
          {
            text: !isBlocked ? "Block User" : "Unblock User",
            data: "block",
            role: !isBlocked ? "destructive" : undefined,
            icon: removeCircleOutline,
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
        onWillDismiss={async (e) => {
          setOpen(false);

          switch (e.detail.data) {
            case "message": {
              router.push(buildGeneralBrowseLink(`/u/${handle}/message`));
              break;
            }
            case "block": {
              if (!user) return;

              try {
                await dispatch(blockUser(!isBlocked, user.id));
              } catch (error) {
                present(problemBlockingUser);

                throw error;
              }

              present(buildBlocked(!isBlocked, handle));
            }
          }
        }}
      />
    </>
  );
}
