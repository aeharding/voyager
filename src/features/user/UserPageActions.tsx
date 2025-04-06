import { IonButton } from "@ionic/react";

import HeaderEllipsisIcon from "#/features/shared/HeaderEllipsisIcon";
import { getShareIcon } from "#/helpers/device";
import { getApId } from "#/helpers/lemmyCompat";
import { shareUrl } from "#/helpers/share";

import { useAppSelector } from "../../store";
import usePresentUserActions from "./usePresentUserActions";

interface UserPageActionsProps {
  handle: string;
}

export default function UserPageActions({ handle }: UserPageActionsProps) {
  const presentUserActions = usePresentUserActions();

  const user = useAppSelector(
    (state) => state.user.userByHandle[handle.toLowerCase()],
  );

  return (
    <>
      <IonButton
        disabled={!user}
        onClick={() => {
          if (!user) return;

          presentUserActions(user, {
            appendButtons: [
              {
                text: "Share",
                icon: getShareIcon(),
                handler: () => {
                  shareUrl(getApId(user));
                },
              },
            ],
          });
        }}
      >
        <HeaderEllipsisIcon slot="icon-only" />
      </IonButton>
    </>
  );
}
