import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { parseJWT } from "../../helpers/lemmy";
import { getClient } from "../../services/lemmy";

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
  return account?.jwt;
});

export const jwtPayloadSelector = createSelector([jwtSelector], (jwt) =>
  jwt ? parseJWT(jwt) : undefined,
);

export const jwtIssSelector = (state: RootState) =>
  jwtPayloadSelector(state)?.iss;

export const handleSelector = createSelector([activeAccount], (account) => {
  return account?.handle;
});

export const usernameSelector = createSelector([handleSelector], (handle) => {
  return handle?.split("@")[0];
});

export const urlSelector = (state: RootState) =>
  jwtIssSelector(state) ?? state.auth.connectedInstance;

export const clientSelector = createSelector(
  [urlSelector, jwtSelector],
  (url, jwt) => {
    // never leak the jwt to the incorrect server
    return getClient(url, jwt);
  },
);
