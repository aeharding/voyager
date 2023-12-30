import { ResolveObjectResponse } from "lemmy-js-client";
import { AppDispatch, RootState } from "../../store";
import { clientSelector } from "../auth/authSelectors";
import { receivedComments } from "../comment/commentSlice";
import { receivedCommunity } from "../community/communitySlice";
import { receivedPosts } from "../post/postSlice";
import { receivedUsers } from "../user/userSlice";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { isLemmyError } from "../../helpers/lemmy";

interface ResolveState {
  objectByUrl: Record<string, "couldnt_find_object" | ResolveObjectResponse>;
}

const initialState: ResolveState = {
  objectByUrl: {},
};

export const resolveSlice = createSlice({
  name: "resolve",
  initialState,
  reducers: {
    couldNotFindUrl: (state, action: PayloadAction<string>) => {
      state.objectByUrl[action.payload] = "couldnt_find_object";
    },
    resolvedObject: (
      state,
      action: PayloadAction<{
        url: string;
        object: ResolveObjectResponse;
      }>,
    ) => {
      state.objectByUrl[action.payload.url] = action.payload.object;
    },
    resetResolve: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const { couldNotFindUrl, resolvedObject, resetResolve } =
  resolveSlice.actions;

export default resolveSlice.reducer;

/**
 *
 * @param url Any URL of a remote Lemmy resource
 * @returns The object, if found
 */
export const resolveObject =
  (url: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    let object;

    try {
      object = await clientSelector(getState()).resolveObject({
        q: url,
      });
    } catch (error) {
      if (isLemmyError(error, "couldnt_find_object"))
        dispatch(couldNotFindUrl(url));

      throw error;
    }

    if (object.comment) {
      dispatch(receivedComments([object.comment]));
    } else if (object.community) {
      dispatch(receivedCommunity(object.community));
    } else if (object.person) {
      dispatch(receivedUsers([object.person.person]));
    } else if (object.post) {
      dispatch(receivedPosts([object.post]));
    }

    dispatch(resolvedObject({ url, object }));

    return object;
  };
