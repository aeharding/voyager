import { IonButton } from "@ionic/react";

import { useShare } from "#/features/share/share";
import HeaderEllipsisIcon from "#/features/shared/HeaderEllipsisIcon";
import { getShareIcon } from "#/helpers/device";
import { getApId } from "#/helpers/lemmyCompat";

import { useAppSelector } from "../../store";
import useShareUserCommunity from "../share/useShareUserCommunity";
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
