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
  IonReorderGroup,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../../store";
import { useEffect, useRef, useState } from "react";
import Account from "./Account";
import { setAccounts } from "./authSlice";
import { moveItem } from "../../helpers/array";
import { loggedInAccountsSelector } from "./authSelectors";

interface AccountSwitcherProps {
  onDismiss: (data?: string, role?: string) => void;
  presentLogin: () => void;
  onSelectAccount: (account: string) => void;
  allowEdit?: boolean;
  showGuest?: boolean;
  activeHandle?: string;
}

export default function AccountSwitcher({
  onDismiss,
  presentLogin,
  onSelectAccount,
  allowEdit = true,
  showGuest = true,
  activeHandle: _activeHandle,
}: AccountSwitcherProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const accounts = useAppSelector(
    showGuest
      ? (state) => state.auth.accountData?.accounts
      : loggedInAccountsSelector,
  );
  const oldAccountsCountRef = useRef(accounts?.length ?? 0);
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

  useEffect(() => {
    const newAccountsCount = accounts?.length ?? 0;

    // On new account added, set no longer editing
    if (newAccountsCount > oldAccountsCountRef.current) {
      setEditing(false);
    }

    oldAccountsCountRef.current = newAccountsCount;
  }, [accounts]);

  const accountEls = accounts?.map((account) => (
    <Account
      key={account.handle}
      account={account}
      editing={editing}
      allowEdit={allowEdit}
    />
  ));

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
        {!editing ? (
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
            <IonList>{accountEls}</IonList>
          </IonRadioGroup>
        ) : (
          <IonList>
            <IonReorderGroup
              onIonItemReorder={(event) => {
                if (accounts)
                  dispatch(
                    setAccounts(
                      moveItem(accounts, event.detail.from, event.detail.to),
                    ),
                  );

                event.detail.complete();
              }}
              disabled={false}
            >
              {accountEls}
            </IonReorderGroup>
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
}
