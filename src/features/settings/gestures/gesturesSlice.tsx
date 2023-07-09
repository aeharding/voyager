import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  SwipeAction,
  SwipeActions,
  db,
  default_swipe_actions_post,
  default_swipe_actions_comment,
  default_swipe_actions_inbox,
} from "../../../services/db";

interface GestureState {
  swipe: {
    post: SwipeActions;
    comment: SwipeActions;
    inbox: SwipeActions;
  };
}

const initialState: GestureState = {
  swipe: {
    post: default_swipe_actions_post,
    comment: default_swipe_actions_comment,
    inbox: default_swipe_actions_inbox,
  },
};

export const gestureSlice = createSlice({
  name: "gesture",
  initialState: initialState,
  extraReducers: (builder) => {
    builder.addCase(
      fetchGesturesFromDatabase.fulfilled,
      (_, action: PayloadAction<GestureState>) => action.payload
    );
  },
  reducers: {
    setPostSwipeActionFarStart(state, action: PayloadAction<SwipeAction>) {
      state.swipe.post.far_start = action.payload;
      db.setSetting("gesture_swipe_post", { ...state.swipe.post });
    },
    setPostSwipeActionStart(state, action: PayloadAction<SwipeAction>) {
      state.swipe.post.start = action.payload;
      db.setSetting("gesture_swipe_post", { ...state.swipe.post });
    },
    setPostSwipeActionEnd(state, action: PayloadAction<SwipeAction>) {
      state.swipe.post.end = action.payload;
      db.setSetting("gesture_swipe_post", { ...state.swipe.post });
    },
    setPostSwipeActionFarEnd(state, action: PayloadAction<SwipeAction>) {
      state.swipe.post.far_end = action.payload;
      db.setSetting("gesture_swipe_post", { ...state.swipe.post });
    },
    setCommentSwipeActionFarStart(state, action: PayloadAction<SwipeAction>) {
      state.swipe.comment.far_start = action.payload;
      db.setSetting("gesture_swipe_comment", { ...state.swipe.comment });
    },
    setCommentSwipeActionStart(state, action: PayloadAction<SwipeAction>) {
      state.swipe.comment.start = action.payload;
      db.setSetting("gesture_swipe_comment", { ...state.swipe.comment });
    },
    setCommentSwipeActionEnd(state, action: PayloadAction<SwipeAction>) {
      state.swipe.comment.end = action.payload;
      db.setSetting("gesture_swipe_comment", { ...state.swipe.comment });
    },
    setCommentSwipeActionFarEnd(state, action: PayloadAction<SwipeAction>) {
      state.swipe.comment.far_end = action.payload;
      db.setSetting("gesture_swipe_comment", { ...state.swipe.comment });
    },
    setInboxSwipeActionFarStart(state, action: PayloadAction<SwipeAction>) {
      state.swipe.inbox.far_start = action.payload;
      db.setSetting("gesture_swipe_inbox", { ...state.swipe.inbox });
    },
    setInboxSwipeActionStart(state, action: PayloadAction<SwipeAction>) {
      state.swipe.inbox.start = action.payload;
      db.setSetting("gesture_swipe_inbox", { ...state.swipe.inbox });
    },
    setInboxSwipeActionEnd(state, action: PayloadAction<SwipeAction>) {
      state.swipe.inbox.end = action.payload;
      db.setSetting("gesture_swipe_inbox", { ...state.swipe.inbox });
    },
    setInboxSwipeActionFarEnd(state, action: PayloadAction<SwipeAction>) {
      state.swipe.inbox.far_end = action.payload;
      db.setSetting("gesture_swipe_inbox", { ...state.swipe.inbox });
    },
    resetGestures: () => initialState,
  },
});

export const fetchGesturesFromDatabase = createAsyncThunk<GestureState>(
  "gesture/fetchGesturesFromDatabase",
  async () => {
    return db.transaction("r", db.settings, async () => {
      const gesture_swipe_post = await db.getSetting("gesture_swipe_post");
      const gesture_swipe_comment = await db.getSetting(
        "gesture_swipe_comment"
      );
      const gesture_swipe_inbox = await db.getSetting("gesture_swipe_inbox");

      return {
        swipe: {
          post: gesture_swipe_post ?? initialState.swipe.post,
          comment: gesture_swipe_comment ?? initialState.swipe.comment,
          inbox: gesture_swipe_inbox ?? initialState.swipe.inbox,
        },
      };
    });
  }
);

export const {
  setPostSwipeActionFarStart,
  setPostSwipeActionStart,
  setPostSwipeActionEnd,
  setPostSwipeActionFarEnd,
  setCommentSwipeActionFarStart,
  setCommentSwipeActionStart,
  setCommentSwipeActionEnd,
  setCommentSwipeActionFarEnd,
  setInboxSwipeActionFarEnd,
  setInboxSwipeActionFarStart,
  setInboxSwipeActionEnd,
  setInboxSwipeActionStart,
} = gestureSlice.actions;

export default gestureSlice.reducer;
