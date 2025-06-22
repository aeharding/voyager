import { createSelector } from "@reduxjs/toolkit";

import { parseLemmyJWT } from "#/helpers/lemmy";
import { getClient } from "#/services/client";
import { RootState } from "#/store";

export const activeAccount = createSelector(
  [
    (state: RootState) => state.auth.accountData?.accounts,
    (state: RootState) => state.auth.accountData?.activeHandle,
  ],
  (accounts, activeHandle) => {
    return accounts?.find(({ handle }) => handle === activeHandle);
  },
);

export const jwtSelector = createSelector([activeAccount], (account) => {
  return account && "jwt" in account ? account.jwt : undefined;
});

export const jwtPayloadSelector = createSelector([jwtSelector], (jwt) =>
  jwt ? parseLemmyJWT(jwt) : undefined,
);

export const jwtIssSelector = (state: RootState) =>
  jwtPayloadSelector(state)?.iss;

/**
 * Warning: This could be a logged-out handle, e.g. "lemmy.world"
 */
export const handleSelector = createSelector(
  [activeAccount],
  (account) => account?.handle,
);

export const userHandleSelector = createSelector([activeAccount], (account) => {
  if (!account || !account.handle.includes("@")) return;

  return account.handle;
});

export const usernameSelector = createSelector(
  [userHandleSelector],
  (handle) => handle?.split("@")[0],
);

export const instanceSelector = createSelector([handleSelector], (handle) => {
  if (!handle) return;

  return getInstanceFromHandle(handle);
});

export const urlSelector = (state: RootState) => {
  return instanceSelector(state) ?? state.auth.connectedInstance;
};

export const clientSelector = createSelector(
  [urlSelector, jwtSelector],
  (url, jwt) => {
    // never leak the jwt to the incorrect server
    return getClient(url, jwt);
  },
);

export const handleOrInstanceSelector = (state: RootState) =>
  handleSelector(state) ?? state.auth.connectedInstance;

export const accountsListEmptySelector = (state: RootState) => {
  if (!state.auth.accountData?.accounts.length) return true;

  if (
    state.auth.accountData.accounts.length === 1 &&
    !state.auth.accountData.accounts[0]?.jwt
  )
    return true;

  return false;
};

export const loggedInSelector = createSelector(
  [handleSelector],
  (profile) => !!profile?.includes("@"),
);

export function getInstanceFromHandle(handle: string): string {
  return handle.split("@").pop()!;
}

export const loggedInAccountsSelector = createSelector(
  [(state: RootState) => state.auth.accountData?.accounts],
  (accounts) => accounts?.filter(({ jwt }) => jwt),
);
