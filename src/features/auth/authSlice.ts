import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { GetSiteResponse, LemmyHttp } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../store";
import Cookies from "js-cookie";
import { LemmyJWT } from "../../helpers/lemmy";
import { resetPosts } from "../post/postSlice";

interface PostState {
  jwt: string | undefined;
  site: GetSiteResponse | undefined;
}

const COOKIE_NAME = "jwt";

const initialState: () => PostState = () => ({
  jwt: Cookies.get(COOKIE_NAME),
  site: undefined,
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateToken: (state, action: PayloadAction<string>) => {
      state.jwt = action.payload;
    },
    reset: () => initialState(),
    updateUserDetails(state, action: PayloadAction<GetSiteResponse>) {
      state.site = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateToken, reset, updateUserDetails } = authSlice.actions;

export default authSlice.reducer;

export const jwtPayloadSelector = createSelector(
  [(state: RootState) => state.auth.jwt],
  (jwt) => (jwt ? parseJWT(jwt) : undefined)
);

export const jwtIssSelector = (state: RootState) =>
  jwtPayloadSelector(state)?.iss;

export const handleSelector = createSelector(
  [(state: RootState) => state.auth.site, jwtIssSelector],
  (site, iss) => {
    const username = site?.my_user?.local_user_view.person.name;

    if (!username) return;

    return `${username}@${iss}`;
  }
);

export const clientSelector = createSelector(
  [jwtPayloadSelector],
  (jwtPayload) => {
    if (!jwtPayload) return;

    return new LemmyHttp(`/api/${jwtPayload.iss}`);
  }
);

export const login =
  (client: LemmyHttp, username: string, password: string) =>
  async (dispatch: AppDispatch) => {
    let res;

    try {
      res = await client.login({ username_or_email: username, password });
    } catch (error) {
      // todo
      throw error;
    }

    if (!res.jwt) {
      // todo
      throw new Error("broke");
    }

    Cookies.set(COOKIE_NAME, res.jwt, {
      expires: 365,
      secure: import.meta.env.PROD,
    });
    dispatch(updateToken(res.jwt));
  };

export const getSelf =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwtPayload = jwtPayloadSelector(getState());

    if (!jwtPayload) return;

    const { iss, sub } = jwtPayload;

    const details = await new LemmyHttp(`/api/${iss}`).getSite({
      auth: getState().auth.jwt,
    });

    dispatch(updateUserDetails(details));
  };

export const logout = () => async (dispatch: AppDispatch) => {
  Cookies.remove(COOKIE_NAME);
  dispatch(reset());
  dispatch(resetPosts());
};

function parseJWT(payload: string): LemmyJWT {
  const base64 = payload.split(".")[1];
  const jsonPayload = atob(base64);
  return JSON.parse(jsonPayload);
}
