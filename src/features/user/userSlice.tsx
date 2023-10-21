import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../../store";
import { clientSelector, getSite } from "../auth/authSlice";
import { getHandle } from "../../helpers/lemmy";
import { LIMIT } from "../../services/lemmy";
import { receivedComments } from "../comment/commentSlice";
import { Person } from "lemmy-js-client";

interface CommentState {
  userByHandle: Dictionary<Person>;
}

const initialState: CommentState = {
  userByHandle: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    receivedUsers: (state, action: PayloadAction<Person[]>) => {
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
    const personResponse = await clientSelector(getState())?.getPersonDetails({
      username: handle,
      limit: LIMIT,
      sort: "New",
    });

    dispatch(receivedUsers([personResponse.person_view.person]));
    dispatch(receivedComments(personResponse.comments));

    return personResponse;
  };

export const blockUser =
  (block: boolean, id: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!id) return;

    const response = await clientSelector(getState())?.blockPerson({
      person_id: id,
      block,
    });

    dispatch(receivedUsers([response.person_view.person]));
    await dispatch(getSite());
  };
