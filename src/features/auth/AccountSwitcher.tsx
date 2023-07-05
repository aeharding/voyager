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
  useIonModal,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../../store";
import { changeAccount } from "./authSlice";
import Login from "./Login";
import { useEffect, useState } from "react";
import Account from "./Account";

interface AccountSwitcherProps {
  onDismiss: (data?: string, role?: string) => void;
  page: HTMLElement | undefined;
}

export default function AccountSwitcher({
  onDismiss,
  page,
}: AccountSwitcherProps) {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.auth.accountData?.accounts);
  const activeHandle = useAppSelector(
    (state) => state.auth.accountData?.activeHandle
  );
  const [editing, setEditing] = useState(false);

  // Modals don't access to PageContext, so just inject the login modal manually
  const [login, onDismissLogin] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismissLogin(data, role),
  });

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
              <IonButton onClick={() => login({ presentingElement: page })}>
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
