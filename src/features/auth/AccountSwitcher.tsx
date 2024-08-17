import {
  IonButton,
  IonButtons,
  IonContent,
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
import { useContext, useEffect, useState } from "react";
import Account from "./Account";
import { setAccounts } from "./authSlice";
import { moveItem } from "../../helpers/array";
import { loggedInAccountsSelector } from "./authSelectors";
import AppHeader from "../shared/AppHeader";
import {
  ListEditButton,
  ListEditorContext,
  ListEditorProvider,
} from "../shared/ListEditor";

type AccountSwitcherProps = {
  onDismiss: (data?: string, role?: string) => void;
  onSelectAccount: (account: string) => void;
  showGuest?: boolean;
  activeHandle?: string;
} & (
  | {
      allowEdit?: true;
      presentLogin: () => void;
    }
  | {
      allowEdit: false;
    }
);

export default function AccountSwitcher(props: AccountSwitcherProps) {
  return (
    <ListEditorProvider>
      <AccountSwitcherContents {...props} />
    </ListEditorProvider>
  );
}

function AccountSwitcherContents({
  onDismiss,
  onSelectAccount,
  allowEdit = true,
  showGuest = true,
  activeHandle: _activeHandle,
  ...rest
}: AccountSwitcherProps) {
  // presentLogin only exists if allowEdit = false
  let presentLogin: (() => void) | undefined;
  if ("presentLogin" in rest) presentLogin = rest.presentLogin;

  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const accounts = useAppSelector(
    showGuest
      ? (state) => state.auth.accountData?.accounts
      : loggedInAccountsSelector,
  );

  const appActiveHandle = useAppSelector(
    (state) => state.auth.accountData?.activeHandle,
  );

  const [selectedAccount, setSelectedAccount] = useState(
    _activeHandle ?? appActiveHandle,
  );

  const { editing } = useContext(ListEditorContext);

  useEffect(() => {
    setSelectedAccount(_activeHandle ?? appActiveHandle);
  }, [_activeHandle, appActiveHandle]);

  useEffect(() => {
    if (accounts?.length) return;

    onDismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {editing ? (
              <IonButton onClick={() => presentLogin?.()}>
                <IonIcon icon={add} />
              </IonButton>
            ) : (
              <IonButton onClick={() => onDismiss()}>Cancel</IonButton>
            )}
          </IonButtons>
          <IonTitle>Accounts</IonTitle>
          {allowEdit && (
            <IonButtons slot="end">
              <ListEditButton />
            </IonButtons>
          )}
        </IonToolbar>
      </AppHeader>
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
