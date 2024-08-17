import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonRadio,
  IonReorder,
  IonText,
} from "@ionic/react";
import { Credential, logoutAccount } from "./authSlice";
import { useAppDispatch } from "../../store";
import { RemoveItemButton } from "../shared/ListEditor";

interface AccountProps {
  editing: boolean;
  account: Credential;
  allowEdit: boolean;
}

export default function Account({ editing, account, allowEdit }: AccountProps) {
  const dispatch = useAppDispatch();

  function logout() {
    dispatch(logoutAccount(account.handle));
  }

  const isGuest = !account.jwt;

  const label = (
    <>
      {account.handle} {isGuest && <IonText color="medium">(guest)</IonText>}
    </>
  );

  return (
    <IonItemSliding>
      {allowEdit && (
        <IonItemOptions side="end" onIonSwipe={logout}>
          <IonItemOption color="danger" expandable onClick={logout}>
            {isGuest ? "Remove" : "Log out"}
          </IonItemOption>
        </IonItemOptions>
      )}
      <IonItem>
        {editing && <RemoveItemButton />}
        {editing ? (
          <>
            <IonLabel className="ion-text-nowrap">{label}</IonLabel>
            <IonReorder slot="end" />
          </>
        ) : (
          <IonRadio value={account.handle}>{label}</IonRadio>
        )}
      </IonItem>
    </IonItemSliding>
  );
}
