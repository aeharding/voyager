import { useIonModal } from "@ionic/react";
import { noop } from "es-toolkit";
import { createContext, use, useState } from "react";
import { ThreadiverseClient } from "threadiverse";

import AccountSwitcher from "#/features/auth/AccountSwitcher";
import {
  loggedInAccountsSelector,
  userHandleSelector,
} from "#/features/auth/authSelectors";
import { Credential } from "#/features/auth/authSlice";
import { getClient } from "#/services/client";
import { useAppSelector } from "#/store";

const TemporarySelectedAccountContext = createContext<{
  account: Credential | undefined;
  accountClient: ThreadiverseClient | undefined;
  presentAccountSwitcher: (onDidDismiss: () => void) => void;
}>({
  account: undefined,
  accountClient: undefined,
  presentAccountSwitcher: noop,
});

export function useTemporarySelectedAccount() {
  return use(TemporarySelectedAccountContext);
}

export function TemporarySelectedAccountProvider({
  children,
  onSelectAccount,
}: {
  children: React.ReactNode;
  onSelectAccount: (account: string) => Promise<void>;
}) {
  const userHandle = useAppSelector(userHandleSelector);
  const [selectedAccountHandle, setSelectedAccountHandle] =
    useState(userHandle);

  const accounts = useAppSelector(loggedInAccountsSelector);
  const selectedAccount = accounts?.find(
    ({ handle }) => handle === selectedAccountHandle,
  );

  const selectedAccountJwt = selectedAccount?.jwt;
  const selectedAccountClient = (() => {
    if (!selectedAccountHandle) return;

    const instance = selectedAccountHandle.split("@")[1]!;

    return getClient(instance, selectedAccountJwt);
  })();

  const [presentAccountSwitcher, onDismissAccountSwitcher] = useIonModal(
    AccountSwitcher,
    {
      allowEdit: false,
      showGuest: false,
      activeHandle: selectedAccountHandle,
      onDismiss: (data?: string, role?: string) =>
        onDismissAccountSwitcher(data, role),
      onSelectAccount: async (account: string) => {
        await onSelectAccount(account);

        setSelectedAccountHandle(account);
      },
    },
  );

  return (
    <TemporarySelectedAccountContext
      value={{
        account: selectedAccount,
        accountClient: selectedAccountClient,
        presentAccountSwitcher: (onDidDismiss) => {
          if (accounts?.length === 1) return;

          presentAccountSwitcher({
            cssClass: "small",
            onDidDismiss,
          });
        },
      }}
    >
      {children}
    </TemporarySelectedAccountContext>
  );
}
