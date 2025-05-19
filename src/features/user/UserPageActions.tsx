import { IonButton } from "@ionic/react";

import useShareUserCommunity from "#/features/share/useShareUserCommunity";
import HeaderEllipsisIcon from "#/features/shared/HeaderEllipsisIcon";
import { getShareIcon } from "#/helpers/device";

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

  const { share } = useShareUserCommunity(user);

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
                  share();
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
