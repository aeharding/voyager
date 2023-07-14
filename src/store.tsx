import { ReactNode, useEffect } from "react";
import { configureStore } from "@reduxjs/toolkit";
import postSlice from "./features/post/postSlice";
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import authSlice, { handleSelector } from "./features/auth/authSlice";
import commentSlice from "./features/comment/commentSlice";
import communitySlice, {
  getFavoriteCommunities,
} from "./features/community/communitySlice";
import userSlice from "./features/user/userSlice";
import inboxSlice from "./features/inbox/inboxSlice";
import appearanceSlice, {
  fetchSettingsFromDatabase,
} from "./features/settings/appearance/appearanceSlice";

const store = configureStore({
  reducer: {
    post: postSlice,
    comment: commentSlice,
    auth: authSlice,
    community: communitySlice,
    user: userSlice,
    inbox: inboxSlice,
    appearance: appearanceSlice,
  },
});
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;

let lastActiveHandle: string | undefined = undefined;
const handleHandleChange = () => {
  const state = store.getState();
  const activeHandle = handleSelector(state);

  if (activeHandle !== lastActiveHandle) {
    store.dispatch(getFavoriteCommunities());
    lastActiveHandle = activeHandle;
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Load settings from DB into the store
    store.dispatch(fetchSettingsFromDatabase());

    // Subscribe to actions to handle handle changes, this can be used to react to other changes as well
    // to coordinate side effects between slices.
    store.subscribe(handleHandleChange);
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
