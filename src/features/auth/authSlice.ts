import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApplicationContext } from "capacitor-application-context";
import { uniqBy } from "es-toolkit";
import { Register } from "lemmy-js-client";

import { resetComments } from "#/features/comment/commentSlice";
import { resetCommunities } from "#/features/community/communitySlice";
import { resetInbox } from "#/features/inbox/inboxSlice";
import { resetInstances } from "#/features/instances/instancesSlice";
import { resetMod } from "#/features/moderation/modSlice";
import { resetPosts } from "#/features/post/postSlice";
import { resetResolve } from "#/features/resolve/resolveSlice";
import { setDefaultFeed } from "#/features/settings/settingsSlice";
import { resetUsers } from "#/features/user/userSlice";
import { getRemoteHandle, parseLemmyJWT } from "#/helpers/lemmy";
import { getDefaultServer } from "#/services/app";
import { getClient } from "#/services/lemmy";
import { AppDispatch, RootState } from "#/store";

import { getInstanceFromHandle, instanceSelector } from "./authSelectors";
import { receivedSite, resetSite } from "./siteSlice";

const MULTI_ACCOUNT_STORAGE_NAME = "credentials";

/**
 * DO NOT CHANGE this type. It is persisted.
 */
export interface Credential {
  jwt?: string;

  /**
   * Can either be user handle or instance url.
   *
   * e.g. `aeharding@lemmy.world` or `lemmy.world`
   */
  handle: string;
}

/**
 * DO NOT CHANGE this type. It is persisted.
 */
interface CredentialStoragePayload {
  accounts: Credential[];

  /**
   * Can either be user handle or instance url.
   *
   * e.g. `aeharding@lemmy.world` or `lemmy.world`
   */
  activeHandle: string;
}

interface AuthState {
  accountData: CredentialStoragePayload | undefined;
  connectedInstance: string;
}

const initialState: (connectedInstance?: string) => AuthState = (
  connectedInstance = "",
) => ({
  accountData: getCredentialsFromStorage(),
  connectedInstance,
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    addAccount: (state, action: PayloadAction<Credential>) => {
      state.accountData ??= {
        accounts: [action.payload],
        activeHandle: action.payload.handle,
      };

      let cleanedPreviousAccounts;

      if (
        state.accountData.accounts.length === 1 &&
        !state.accountData.accounts[0]?.handle.includes("@")
      ) {
        // If only one account, and it's a guest, just switch it out
        cleanedPreviousAccounts = [action.payload];
      } else {
        // Remove guest accounts for this instance when logging in
        cleanedPreviousAccounts = state.accountData.accounts.filter(
          (a) => a.handle !== getInstanceFromHandle(action.payload.handle),
        );
      }

      const accounts = uniqBy(
        [action.payload, ...cleanedPreviousAccounts],
        (c) => c.handle,
      );

      state.accountData = {
        accounts,
        activeHandle: action.payload.handle,
      };

      updateCredentialsStorage(state.accountData);
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      if (!state.accountData) return;

      const accounts = state.accountData.accounts.filter(
        (a) => a.handle !== action.payload,
      );

      const nextAccount = accounts[0];

      if (!nextAccount) {
        state.accountData = undefined;
        updateCredentialsStorage(undefined);
        return;
      }

      state.accountData.accounts = accounts;
      if (state.accountData.activeHandle === action.payload) {
        state.accountData.activeHandle = nextAccount.handle;
      }

      updateCredentialsStorage(state.accountData);
    },
    setPrimaryAccount: (state, action: PayloadAction<string>) => {
      if (!state.accountData) return;

      state.accountData.activeHandle = action.payload;

      updateCredentialsStorage(state.accountData);
    },
    setAccounts: (state, action: PayloadAction<Credential[]>) => {
      if (!state.accountData) return;

      state.accountData.accounts = action.payload;

      updateCredentialsStorage(state.accountData);
    },
    updateConnectedInstance(state, action: PayloadAction<string>) {
      if (import.meta.env.VITE__TEST_MODE) {
        state.connectedInstance = getDefaultServer();
        return;
      }
      state.connectedInstance = action.payload;
    },
    reset: (state) => {
      return initialState(state.connectedInstance);
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addAccount,
  removeAccount,
  setPrimaryAccount,
  setAccounts,
  updateConnectedInstance,
  reset,
} = authSlice.actions;

export default authSlice.reducer;

export const login =
  (baseUrl: string, username: string, password: string, totp?: string) =>
  async (dispatch: AppDispatch) => {
    const client = getClient(baseUrl);

    const res = await client.login({
      username_or_email: username,
      // lemmy-ui has maxlength of 60. If we don't clamp too users will complain password won't work
      password: password.slice(0, 60),
      totp_2fa_token: totp || undefined,
    });

    if (!res.jwt) {
      // todo
      throw new Error("broke");
    }

    await dispatch(addJwt(baseUrl, res.jwt));
  };

export const register =
  (baseUrl: string, register: Register) => async (dispatch: AppDispatch) => {
    const client = getClient(baseUrl);

    const res = await client.register(register);

    if (!res.jwt) {
      return res;
    }

    await dispatch(addJwt(baseUrl, res.jwt));

    return true;
  };

export const addGuestInstance =
  (url: string) => async (dispatch: AppDispatch) => {
    const client = getClient(url);

    const site = await client.getSite();

    dispatch(resetAccountSpecificStoreData());
    dispatch(receivedSite(site));
    dispatch(addAccount({ handle: url }));
    dispatch(updateConnectedInstance(url));
  };

const addJwt =
  (baseUrl: string, jwt: string) => async (dispatch: AppDispatch) => {
    const authenticatedClient = getClient(baseUrl, jwt);

    const site = await authenticatedClient.getSite();
    const myUser = site.my_user?.local_user_view?.person;

    if (!myUser) throw new Error("broke");

    dispatch(resetAccountSpecificStoreData());
    dispatch(receivedSite(site));
    dispatch(addAccount({ jwt, handle: getRemoteHandle(myUser) }));
    dispatch(updateConnectedInstance(parseLemmyJWT(jwt).iss));
  };

const resetAccountSpecificStoreData = () => (dispatch: AppDispatch) => {
  dispatch(resetPosts());
  dispatch(resetComments());
  dispatch(resetUsers());
  dispatch(resetInbox());
  dispatch(resetCommunities());
  dispatch(resetResolve());
  dispatch(resetInstances());
  dispatch(resetMod());
  dispatch(resetSite());
  dispatch(setDefaultFeed(undefined));
};

export const logoutEverything = () => (dispatch: AppDispatch) => {
  dispatch(reset());
  dispatch(resetAccountSpecificStoreData());
};

export const changeAccount =
  (handle: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(resetAccountSpecificStoreData());
    dispatch(setPrimaryAccount(handle));

    const instanceUrl = instanceSelector(getState());
    if (instanceUrl) dispatch(updateConnectedInstance(instanceUrl));
  };

export const logoutAccount =
  (handle: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const accountData = getState().auth.accountData;
    const currentAccount = accountData?.accounts?.find(
      ({ handle: h }) => handle === h,
    );

    // Going to need to change active accounts
    if (handle === accountData?.activeHandle) {
      dispatch(resetAccountSpecificStoreData());
    }

    // revoke token
    if (currentAccount && currentAccount.jwt)
      getClient(
        parseLemmyJWT(currentAccount.jwt).iss,
        currentAccount.jwt,
      )?.logout();

    dispatch(removeAccount(handle));

    const instanceUrl = instanceSelector(getState());
    if (instanceUrl) dispatch(updateConnectedInstance(instanceUrl));
  };

function updateCredentialsStorage(
  accounts: CredentialStoragePayload | undefined,
) {
  updateApplicationContextIfNeeded(accounts);

  if (!accounts) {
    localStorage.removeItem(MULTI_ACCOUNT_STORAGE_NAME);
    return;
  }

  localStorage.setItem(MULTI_ACCOUNT_STORAGE_NAME, JSON.stringify(accounts));
}

function getCredentialsFromStorage(): CredentialStoragePayload | undefined {
  const serializedCredentials = localStorage.getItem(
    MULTI_ACCOUNT_STORAGE_NAME,
  );
  if (!serializedCredentials) return;
  return JSON.parse(serializedCredentials);
}

// Run once on app load to sync state if needed
updateApplicationContextIfNeeded(getCredentialsFromStorage());

/**
 * This syncs application state for the Apple Watch App
 */
function updateApplicationContextIfNeeded(
  accounts: CredentialStoragePayload | undefined,
) {
  const DEFAULT_INSTANCE = "lemm.ee";

  const connectedInstance = (() => {
    if (!accounts) return DEFAULT_INSTANCE;
    if (!accounts.activeHandle.includes("@")) return accounts.activeHandle;

    return accounts.activeHandle.slice(
      accounts.activeHandle.lastIndexOf("@") + 1,
    );
  })();

  ApplicationContext.updateApplicationContext({
    connectedInstance,
    authToken: accounts
      ? (accounts.accounts.find((a) => a.handle === accounts.activeHandle)
          ?.jwt ?? "")
      : "",
  });
}
