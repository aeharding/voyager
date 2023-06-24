import { configureStore } from "@reduxjs/toolkit";
import postSlice from "./features/post/postSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authSlice from "./features/auth/authSlice";
import commentSlice from "./features/comment/commentSlice";
import communitySlice from "./features/community/communitySlice";
import userSlice from "./features/user/userSlice";
import inboxSlice from "./features/inbox/inboxSlice";

const store = configureStore({
  reducer: {
    post: postSlice,
    comment: commentSlice,
    auth: authSlice,
    community: communitySlice,
    user: userSlice,
    inbox: inboxSlice,
  },
});
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
