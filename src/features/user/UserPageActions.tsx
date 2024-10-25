import { IonButton } from "@ionic/react";
import HeaderEllipsisIcon from "../shared/HeaderEllipsisIcon";
import usePresentUserActions from "./usePresentUserActions";

interface UserPageActionsProps {
  handle: string;
}

export default function UserPageActions({ handle }: UserPageActionsProps) {
  const presentUserActions = usePresentUserActions(handle);

  return (
    <>
      <IonButton disabled={!handle} onClick={presentUserActions}>
        <HeaderEllipsisIcon slot="icon-only" />
      </IonButton>
    </>
  );
}
