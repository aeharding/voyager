import { IonButton } from "@ionic/react";
import HeaderEllipsisIcon from "../shared/HeaderEllipsisIcon";
import usePresentUserActions from "./usePresentUserActions";

interface UserPageActionsProps {
  handle: string;
}

export default function UserPageActions({ handle }: UserPageActionsProps) {
  const presentUserActions = usePresentUserActions();

  return (
    <>
      <IonButton disabled={!handle} onClick={() => presentUserActions(handle)}>
        <HeaderEllipsisIcon slot="icon-only" />
      </IonButton>
    </>
  );
}
