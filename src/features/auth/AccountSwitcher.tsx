import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonList,
  IonLoading,
  IonPage,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useAppSelector } from "../../store";
import { useEffect, useState } from "react";
import Account from "./Account";

interface AccountSwitcherProps {
  onDismiss: (data?: string, role?: string) => void;
  presentLogin: () => void;
  onSelectAccount: (account: string) => void;
  allowLogin?: boolean;
  activeHandle?: string;
}

export default function AccountSwitcher({
  onDismiss,
  presentLogin,
  onSelectAccount,
  allowLogin = true,
  activeHandle: _activeHandle,
}: AccountSwitcherProps) {
  const [loading, setLoading] = useState(false);
  const accounts = useAppSelector((state) => state.auth.accountData?.accounts);
  const appActiveHandle = useAppSelector(
    (state) => state.auth.accountData?.activeHandle,
  );
  const activeHandle = _activeHandle ?? appActiveHandle;
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (accounts?.length) return;

    onDismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  return (
    <IonPage>
      <IonLoading isOpen={loading} />
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
          {allowLogin && (
            <IonButtons slot="end">
              {editing ? (
                <IonButton onClick={() => setEditing(false)}>Done</IonButton>
              ) : (
                <IonButton onClick={() => setEditing(true)}>Edit</IonButton>
              )}
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRadioGroup
          value={activeHandle}
          onIonChange={async (e) => {
            setLoading(true);

            try {
              await onSelectAccount(e.target.value);
            } finally {
              setLoading(false);
            }

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
