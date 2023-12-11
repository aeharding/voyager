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
  allowEdit?: boolean;
  activeHandle?: string;
}

export default function AccountSwitcher({
  onDismiss,
  presentLogin,
  onSelectAccount,
  allowEdit = true,
  activeHandle: _activeHandle,
}: AccountSwitcherProps) {
  const [loading, setLoading] = useState(false);
  const accounts = useAppSelector((state) => state.auth.accountData?.accounts);
  const appActiveHandle = useAppSelector(
    (state) => state.auth.accountData?.activeHandle,
  );
  const [editing, setEditing] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState(
    _activeHandle ?? appActiveHandle,
  );

  useEffect(() => {
    setSelectedAccount(_activeHandle ?? appActiveHandle);
  }, [_activeHandle, appActiveHandle]);

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
          {allowEdit && (
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
          value={selectedAccount}
          onIonChange={async (e) => {
            setLoading(true);
            const old = selectedAccount;
            setSelectedAccount(e.target.value);

            try {
              await onSelectAccount(e.target.value);
            } catch (error) {
              setSelectedAccount(old);
              throw error;
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
                allowEdit={allowEdit}
              />
            ))}
          </IonList>
        </IonRadioGroup>
      </IonContent>
    </IonPage>
  );
}
