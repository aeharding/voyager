import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { clientSelector } from "../auth/authSlice";
import { CommentView, PersonSafe, SortType } from "lemmy-js-client";
import { getHandle } from "../../helpers/lemmy";
import { LIMIT } from "../../services/lemmy";
import { receivedPosts } from "../post/postSlice";
import { receivedComments } from "../comment/commentSlice";

interface CommentState {
  userByHandle: Dictionary<PersonSafe>;
}

const initialState: CommentState = {
  userByHandle: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    receivedUsers: (state, action: PayloadAction<PersonSafe[]>) => {
      for (const user of action.payload) {
        state.userByHandle[getHandle(user)] = user;
      }
    },

    resetUsers: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const { receivedUsers, resetUsers } = userSlice.actions;

export default userSlice.reducer;

export const getUser =
  (handle: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const jwt = getState().auth.jwt;

    const personResponse = await clientSelector(getState())?.getPersonDetails({
      username: handle,
      auth: jwt!,
      limit: LIMIT,
      sort: SortType.New,
    });

    dispatch(receivedUsers([personResponse.person_view.person]));
    dispatch(receivedComments(personResponse.comments));

    return personResponse;
  };
