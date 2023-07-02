import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { GetSiteResponse, LemmyHttp } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../store";
import Cookies from "js-cookie";
import { LemmyJWT, getRemoteHandle } from "../../helpers/lemmy";
import { resetPosts } from "../post/postSlice";
import { getClient } from "../../services/lemmy";
import { resetComments } from "../comment/commentSlice";
import { resetUsers } from "../user/userSlice";
import { resetInbox } from "../inbox/inboxSlice";
import { differenceWith, uniqBy } from "lodash";
import { resetCommunities } from "../community/communitySlice";

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

interface PostState {
  accountData: CredentialStoragePayload | undefined;
  site: GetSiteResponse | undefined;
  connectedInstance: string;
}

const initialState: (connectedInstance?: string) => PostState = (
  connectedInstance = ""
) => ({
  accountData: getCredentialsFromStorage(),
  site: undefined,
  connectedInstance,
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    addAccount: (state, action: PayloadAction<Credential>) => {
      if (!state.accountData) {
        state.accountData = {
          accounts: [action.payload],
          activeHandle: action.payload.handle,
        };
      }

      const accounts = uniqBy(
        [action.payload, ...state.accountData.accounts],
        (c) => c.handle
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
        (a, b) => a.handle === b
      );

      if (accounts.length === 0) {
        state.accountData = undefined;
        updateCredentialsStorage(undefined);
        return;
      }

      state.accountData.accounts = accounts;
      if (state.accountData.activeHandle === action.payload) {
        state.accountData.activeHandle = accounts[0].handle;
      }

      updateCredentialsStorage(state.accountData);
    },
    setPrimaryAccount: (state, action: PayloadAction<string>) => {
      if (!state.accountData) return;

      state.accountData.activeHandle = action.payload;

      updateCredentialsStorage(state.accountData);
    },

    reset: (state) => {
      return initialState(state.connectedInstance);
    },

    updateUserDetails(state, action: PayloadAction<GetSiteResponse>) {
      state.site = action.payload;
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
  reset,
  updateUserDetails,
  updateConnectedInstance,
} = authSlice.actions;

export default authSlice.reducer;

export const activeAccount = createSelector(
  [
    (state: RootState) => state.auth.accountData?.accounts,
    (state: RootState) => state.auth.accountData?.activeHandle,
  ],
  (accounts, activeHandle) => {
    return accounts?.find(({ handle }) => handle === activeHandle);
  }
);

export const jwtSelector = createSelector([activeAccount], (account) => {
  return account?.jwt;
});

export const jwtPayloadSelector = createSelector([jwtSelector], (jwt) =>
  jwt ? parseJWT(jwt) : undefined
);

export const jwtIssSelector = (state: RootState) =>
  jwtPayloadSelector(state)?.iss;

export const handleSelector = createSelector([activeAccount], (account) => {
  return account?.handle;
});

export const login =
  (client: LemmyHttp, username: string, password: string, totp?: string) =>
  async (dispatch: AppDispatch) => {
    const res = await client.login({
      username_or_email: username,
      password,
      totp_2fa_token: totp || undefined,
    });

    if (!res.jwt) {
      // todo
      throw new Error("broke");
    }

    const site = await client.getSite({ auth: res.jwt });
    const myUser = site.my_user?.local_user_view?.person;

    if (!myUser) throw new Error("broke");

    dispatch(addAccount({ jwt: res.jwt, handle: getRemoteHandle(myUser) }));
    dispatch(updateConnectedInstance(parseJWT(res.jwt).iss));
  };

export const getSite =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwtPayload = jwtPayloadSelector(getState());

    if (!jwtPayload) return;

    const { iss } = jwtPayload;

    const details = await getClient(iss).getSite({
      auth: jwtSelector(getState()),
    });

    dispatch(updateUserDetails(details));
  };

export const logoutEverything = () => async (dispatch: AppDispatch) => {
  dispatch(reset());
  dispatch(resetPosts());
  dispatch(resetComments());
  dispatch(resetUsers());
  dispatch(resetInbox());
};

export const changeAccount =
  (handle: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(resetPosts());
    dispatch(resetComments());
    dispatch(resetUsers());
    dispatch(resetInbox());
    dispatch(resetCommunities());
    dispatch(setPrimaryAccount(handle));

    const iss = jwtIssSelector(getState());
    if (iss) dispatch(updateConnectedInstance(iss));
  };

export const logoutAccount =
  (handle: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    // Going to need to change active accounts
    if (handle === getState().auth.accountData?.activeHandle) {
      dispatch(resetPosts());
      dispatch(resetComments());
      dispatch(resetUsers());
      dispatch(resetInbox());
    }

    dispatch(removeAccount(handle));
  };

function parseJWT(payload: string): LemmyJWT {
  const base64 = payload.split(".")[1];
  const jsonPayload = atob(base64);
  return JSON.parse(jsonPayload);
}

export const urlSelector = createSelector(
  [(state: RootState) => state.auth.connectedInstance, jwtIssSelector],
  (connectedInstance, iss) => {
    // never leak the jwt to the incorrect server
    return iss ?? connectedInstance;
  }
);

export const clientSelector = createSelector([urlSelector], (url) => {
  // never leak the jwt to the incorrect server
  return getClient(url);
});

function updateCredentialsStorage(
  accounts: CredentialStoragePayload | undefined
) {
  if (!accounts) {
    localStorage.removeItem(MULTI_ACCOUNT_STORAGE_NAME);
    return;
  }

  localStorage.setItem(MULTI_ACCOUNT_STORAGE_NAME, JSON.stringify(accounts));
}

function getCredentialsFromStorage(): CredentialStoragePayload | undefined {
  const serializedCredentials = localStorage.getItem(
    MULTI_ACCOUNT_STORAGE_NAME
  );
  if (!serializedCredentials) return;
  return JSON.parse(serializedCredentials);
}
