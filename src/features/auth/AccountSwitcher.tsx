import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../../store";
import { changeAccount } from "./authSlice";
import { useEffect, useState } from "react";
import Account from "./Account";

interface AccountSwitcherProps {
  onDismiss: (data?: string, role?: string) => void;
  presentLogin: () => void;
}

export default function AccountSwitcher({
  onDismiss,
  presentLogin,
}: AccountSwitcherProps) {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.auth.accountData?.accounts);
  const activeHandle = useAppSelector(
    (state) => state.auth.accountData?.activeHandle,
  );
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (accounts?.length) return;

    onDismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {editing ? (
              <IonButton onClick={() => presentLogin()}>
                <IonIcon icon={add} />
              </IonButton>
            ) : (
              <IonButton onClick={() => onDismiss()}>Cancel</IonButton>
            )}
          </IonButtons>
          <IonTitle>Accounts</IonTitle>
          <IonButtons slot="end">
            {editing ? (
              <IonButton onClick={() => setEditing(false)}>Done</IonButton>
            ) : (
              <IonButton onClick={() => setEditing(true)}>Edit</IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRadioGroup
          value={activeHandle}
          onIonChange={(e) => {
            dispatch(changeAccount(e.target.value));
            onDismiss();
          }}
        >
          <IonList>
            {accounts?.map((account) => (
              <Account
                key={account.handle}
                account={account}
                editing={editing}
              />
            ))}
          </IonList>
        </IonRadioGroup>
      </IonContent>
    </IonPage>
  );
}
