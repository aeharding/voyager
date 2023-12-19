import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import Cookies from "js-cookie";
import { getRemoteHandle, parseJWT } from "../../helpers/lemmy";
import { resetPosts } from "../post/postSlice";
import { getClient } from "../../services/lemmy";
import { resetComments } from "../comment/commentSlice";
import { resetUsers } from "../user/userSlice";
import { resetInbox } from "../inbox/inboxSlice";
import { differenceWith, uniqBy } from "lodash";
import { resetCommunities } from "../community/communitySlice";
import { ApplicationContext } from "capacitor-application-context";
import { resetInstances } from "../instances/instancesSlice";
import { resetResolve } from "../resolve/resolveSlice";
import { resetMod } from "../moderation/modSlice";
import { jwtIssSelector } from "./authSelectors";
import { resetSite } from "./siteSlice";

const MULTI_ACCOUNT_STORAGE_NAME = "credentials";

// Migrations
(() => {
  // 2023-06-25 clean up cookie used for old versions
  Cookies.remove("jwt");

  // 2023-06-26 prefer localStorage to avoid sending to proxy server
  const cookie = Cookies.get(MULTI_ACCOUNT_STORAGE_NAME);

  if (cookie && !localStorage.getItem(MULTI_ACCOUNT_STORAGE_NAME)) {
    localStorage.setItem(MULTI_ACCOUNT_STORAGE_NAME, cookie);
    Cookies.remove(MULTI_ACCOUNT_STORAGE_NAME);
  }
})();

/**
 * DO NOT CHANGE this type. It is persisted in the login cookie
 */
export interface Credential {
  jwt: string;
  handle: string;
}

/**
 * DO NOT CHANGE this type. It is persisted in localStorage
 */
type CredentialStoragePayload = {
  accounts: Credential[];
  activeHandle: string;
};

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

      const accounts = uniqBy(
        [action.payload, ...state.accountData.accounts],
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

      const accounts = differenceWith(
        state.accountData.accounts,
        [action.payload],
        (a, b) => a.handle === b,
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

    reset: (state) => {
      return initialState(state.connectedInstance);
    },

    updateConnectedInstance(state, action: PayloadAction<string>) {
      state.connectedInstance = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addAccount,
  removeAccount,
  setPrimaryAccount,
  setAccounts,
  reset,
  updateConnectedInstance,
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

    const authenticatedClient = getClient(baseUrl, res.jwt);

    const site = await authenticatedClient.getSite();
    const myUser = site.my_user?.local_user_view?.person;

    if (!myUser) throw new Error("broke");

    dispatch(addAccount({ jwt: res.jwt, handle: getRemoteHandle(myUser) }));
    dispatch(updateConnectedInstance(parseJWT(res.jwt).iss));
  };

const resetAccountSpecificStoreData = () => async (dispatch: AppDispatch) => {
  dispatch(resetPosts());
  dispatch(resetComments());
  dispatch(resetUsers());
  dispatch(resetInbox());
  dispatch(resetCommunities());
  dispatch(resetResolve());
  dispatch(resetInstances());
  dispatch(resetMod());
  dispatch(resetSite());
};

export const logoutEverything = () => async (dispatch: AppDispatch) => {
  dispatch(reset());
  dispatch(resetAccountSpecificStoreData());
};

export const changeAccount =
  (handle: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(resetAccountSpecificStoreData());
    dispatch(setPrimaryAccount(handle));

    const iss = jwtIssSelector(getState());
    if (iss) dispatch(updateConnectedInstance(iss));
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
    if (currentAccount)
      getClient(parseJWT(currentAccount.jwt).iss, currentAccount.jwt)?.logout();

    dispatch(removeAccount(handle));

    const iss = jwtIssSelector(getState());
    if (iss) dispatch(updateConnectedInstance(iss));
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
  ApplicationContext.updateApplicationContext({
    connectedInstance: accounts
      ? accounts.activeHandle.slice(accounts.activeHandle.lastIndexOf("@") + 1)
      : "lemmy.world",
    authToken: accounts
      ? accounts.accounts.find((a) => a.handle === accounts.activeHandle)
          ?.jwt ?? ""
      : "",
  });
}
