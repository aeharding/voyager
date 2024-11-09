import { IonButton } from "@ionic/react";

import HeaderEllipsisIcon from "#/features/shared/HeaderEllipsisIcon";

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

          presentUserActions(user);
        }}
      >
        <HeaderEllipsisIcon slot="icon-only" />
      </IonButton>
    </>
  );
}
