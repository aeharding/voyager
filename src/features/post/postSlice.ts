import { Dictionary, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { PostView } from "lemmy-js-client";

interface PostState {
  postById: Dictionary<PostView>;
}

const initialState: PostState = { postById: {} };

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    receivedPosts: (state, action: PayloadAction<PostView[]>) => {
      for (const post of action.payload) {
        state.postById[post.post.id] = post;
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { receivedPosts } = counterSlice.actions;

export default counterSlice.reducer;
