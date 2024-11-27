import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  db,
  LongSwipeTriggerPointType,
  OLongSwipeTriggerPointType,
  OSwipeActionComment,
  OSwipeActionInbox,
  OSwipeActionPost,
  SwipeAction,
  SwipeActions,
} from "#/services/db";

interface GestureState {
  swipe: {
    post: SwipeActions;
    comment: SwipeActions;
    inbox: SwipeActions;
    disableLeftSwipes: boolean;
    disableRightSwipes: boolean;
    longSwipeTriggerPoint: LongSwipeTriggerPointType;
  };
}

const defaultSwipeActionsPost: SwipeActions = {
  farStart: OSwipeActionPost.Downvote,
  start: OSwipeActionPost.Upvote,
  end: OSwipeActionPost.Reply,
  farEnd: OSwipeActionPost.Save,
} as const;

const defaultSwipeActionsComment: SwipeActions = {
  farStart: OSwipeActionComment.Downvote,
  start: OSwipeActionComment.Upvote,
  end: OSwipeActionComment.CollapseToTop,
  farEnd: OSwipeActionComment.Reply,
} as const;

const defaultSwipeActionsInbox: SwipeActions = {
  farStart: OSwipeActionInbox.Downvote,
  start: OSwipeActionInbox.Upvote,
  end: OSwipeActionInbox.MarkUnread,
  farEnd: OSwipeActionInbox.Reply,
} as const;

const initialState: GestureState = {
  swipe: {
    post: defaultSwipeActionsPost,
    comment: defaultSwipeActionsComment,
    inbox: defaultSwipeActionsInbox,
    disableLeftSwipes: false,
    disableRightSwipes: false,
    longSwipeTriggerPoint: OLongSwipeTriggerPointType.Normal,
  },
};

export const gestureSlice = createSlice({
  name: "gesture",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(
      fetchGesturesFromDatabase.fulfilled,
      (_, action: PayloadAction<GestureState>) => action.payload,
    );
  },
  reducers: {
    setPostSwipeActionFarStart(state, action: PayloadAction<SwipeAction>) {
      state.swipe.post.farStart = action.payload;
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
      state.swipe.post.farEnd = action.payload;
      db.setSetting("gesture_swipe_post", { ...state.swipe.post });
    },
    setCommentSwipeActionFarStart(state, action: PayloadAction<SwipeAction>) {
      state.swipe.comment.farStart = action.payload;
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
      state.swipe.comment.farEnd = action.payload;
      db.setSetting("gesture_swipe_comment", { ...state.swipe.comment });
    },
    setInboxSwipeActionFarStart(state, action: PayloadAction<SwipeAction>) {
      state.swipe.inbox.farStart = action.payload;
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
      state.swipe.inbox.farEnd = action.payload;
      db.setSetting("gesture_swipe_inbox", { ...state.swipe.inbox });
    },
    setDisableLeftSwipes(state, action: PayloadAction<boolean>) {
      state.swipe.disableLeftSwipes = action.payload;
      db.setSetting("disable_left_swipes", action.payload);
    },
    setDisableRightSwipes(state, action: PayloadAction<boolean>) {
      state.swipe.disableRightSwipes = action.payload;
      db.setSetting("disable_right_swipes", action.payload);
    },
    setLongSwipeTriggerPoint(
      state,
      action: PayloadAction<LongSwipeTriggerPointType>,
    ) {
      state.swipe.longSwipeTriggerPoint = action.payload;
      db.setSetting("long_swipe_trigger_point", action.payload);
    },

    setAllSwipesToDefault(state) {
      state.swipe.post = defaultSwipeActionsPost;
      state.swipe.comment = defaultSwipeActionsComment;
      state.swipe.inbox = defaultSwipeActionsInbox;
      db.setSetting("gesture_swipe_post", { ...state.swipe.post });
      db.setSetting("gesture_swipe_comment", { ...state.swipe.comment });
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
        "gesture_swipe_comment",
      );
      const gesture_swipe_inbox = await db.getSetting("gesture_swipe_inbox");
      const disable_left_swipes = await db.getSetting("disable_left_swipes");
      const disable_right_swipes = await db.getSetting("disable_right_swipes");
      const long_swipe_trigger_point = await db.getSetting(
        "long_swipe_trigger_point",
      );

      return {
        swipe: {
          post: gesture_swipe_post ?? initialState.swipe.post,
          comment: gesture_swipe_comment ?? initialState.swipe.comment,
          inbox: gesture_swipe_inbox ?? initialState.swipe.inbox,
          disableLeftSwipes:
            disable_left_swipes ?? initialState.swipe.disableLeftSwipes,
          disableRightSwipes:
            disable_right_swipes ?? initialState.swipe.disableRightSwipes,
          longSwipeTriggerPoint:
            long_swipe_trigger_point ??
            initialState.swipe.longSwipeTriggerPoint,
        },
      };
    });
  },
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
  setDisableLeftSwipes,
  setDisableRightSwipes,
  setLongSwipeTriggerPoint,
  setAllSwipesToDefault,
} = gestureSlice.actions;

export default gestureSlice.reducer;
