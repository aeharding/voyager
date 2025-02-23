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
import { useContext, useEffect, useState } from "react";

import AppHeader from "#/features/shared/AppHeader";
import {
  ListEditButton,
  ListEditorContext,
  ListEditorProvider,
} from "#/features/shared/ListEditor";
import { moveItem } from "#/helpers/array";
import { isPromiseResolvedByPaint } from "#/helpers/promise";
import { useAppDispatch, useAppSelector } from "#/store";

import Account from "./Account";
import { loggedInAccountsSelector } from "./authSelectors";
import { setAccounts } from "./authSlice";

type AccountSwitcherProps = {
  onDismiss: (data?: string, role?: string) => void;
  onSelectAccount: ((account: string) => Promise<void>) | void;
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
  }, [accounts, onDismiss]);

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
              const old = selectedAccount;
              setSelectedAccount(e.target.value);

              const selectionChangePromise = onSelectAccount?.(e.target.value);

              // Bail on rendering the loading indicator
              if (
                !selectionChangePromise ||
                (await isPromiseResolvedByPaint(selectionChangePromise))
              ) {
                onDismiss();
                return;
              }

              setLoading(true);

              try {
                await selectionChangePromise;
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
