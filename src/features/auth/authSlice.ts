import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { GetSiteResponse } from "lemmy-js-client";
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
import { ApplicationContext } from "capacitor-application-context";
import { resetInstances } from "../instances/instancesSlice";
import { resetResolve } from "../resolve/resolveSlice";

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
  loadingSite: string;
  connectedInstance: string;
}

const initialState: (connectedInstance?: string) => PostState = (
  connectedInstance = "",
) => ({
  accountData: getCredentialsFromStorage(),
  site: undefined,
  loadingSite: "",
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
    loadingSite(state, action: PayloadAction<string>) {
      state.loadingSite = action.payload;
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
  loadingSite,
} = authSlice.actions;

export default authSlice.reducer;

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

export const isAdminSelector = (state: RootState) =>
  state.auth.site?.my_user?.local_user_view.local_user.admin;

export const isDownvoteEnabledSelector = (state: RootState) =>
  state.auth.site?.site_view.local_site.enable_downvotes !== false;

export const localUserSelector = (state: RootState) =>
  state.auth.site?.my_user?.local_user_view.local_user;

export const login =
  (baseUrl: string, username: string, password: string, totp?: string) =>
  async (dispatch: AppDispatch) => {
    const client = getClient(baseUrl);

    const res = await client.login({
      username_or_email: username,
      password,
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

export const getSiteIfNeeded =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwtPayload = jwtPayloadSelector(getState());
    const instance = jwtPayload?.iss ?? getState().auth.connectedInstance;

    const handle = handleSelector(getState());

    if (getLoadingSiteId(instance, handle) === getState().auth.loadingSite)
      return;

    dispatch(loadingSite(getLoadingSiteId(instance, handle)));

    dispatch(getSite());
  };

export const getSite =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwtPayload = jwtPayloadSelector(getState());
    const instance = jwtPayload?.iss ?? getState().auth.connectedInstance;

    const details = await getClient(
      instance,
      jwtSelector(getState()),
    ).getSite();

    dispatch(updateUserDetails(details));
  };

const resetAccountSpecificStoreData = () => async (dispatch: AppDispatch) => {
  dispatch(resetPosts());
  dispatch(resetComments());
  dispatch(resetUsers());
  dispatch(resetInbox());
  dispatch(resetCommunities());
  dispatch(resetResolve());
  dispatch(resetInstances());
};

export const logoutEverything = () => async (dispatch: AppDispatch) => {
  dispatch(reset());
  dispatch(resetAccountSpecificStoreData());
};

export const changeAccount =
  (handle: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(resetAccountSpecificStoreData());
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

    const iss = jwtIssSelector(getState());
    if (iss) dispatch(updateConnectedInstance(iss));
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
  },
);

export const clientSelector = createSelector(
  [urlSelector, jwtSelector],
  (url, jwt) => {
    // never leak the jwt to the incorrect server
    return getClient(url, jwt);
  },
);

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

export const showNsfw =
  (show: boolean) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    // https://github.com/LemmyNet/lemmy/issues/3565
    const person = getState().auth.site?.my_user?.local_user_view.person;

    if (!person || handleSelector(getState()) !== getRemoteHandle(person))
      throw new Error("user mismatch");

    await clientSelector(getState())?.saveUserSettings({
      avatar: person?.avatar || "",
      show_nsfw: show,
    });

    await dispatch(getSite());
  };

function getLoadingSiteId(instance: string, handle: string | undefined) {
  if (!handle) return instance;

  return `${instance}-${handle}`;
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
