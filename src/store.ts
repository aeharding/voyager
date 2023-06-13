import { configureStore } from "@reduxjs/toolkit";
import postSlice from "./features/post/postSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authSlice from "./features/auth/authSlice";

const store = configureStore({
  reducer: {
    post: postSlice,
    auth: authSlice,
  },
});
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
