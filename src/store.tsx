import { ReactNode, useEffect } from "react";
import { ActionCreatorWithPayload, configureStore } from "@reduxjs/toolkit";
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
import settingsSlice, {
  fetchSettingsFromDatabase,
  getBlurNsfw,
  getDefaultFeed,
  getFilteredKeywords,
} from "./features/settings/settingsSlice";
import gestureSlice, {
  fetchGesturesFromDatabase,
} from "./features/settings/gestures/gestureSlice";
import appIconSlice, {
  fetchAppIcon,
} from "./features/settings/app-icon/appIconSlice";
import instancesSlice, {
  getInstances,
} from "./features/instances/instancesSlice";
import resolveSlice from "./features/resolve/resolveSlice";
import biometricSlice, {
  initializeBiometricSliceDataIfNeeded,
} from "./features/settings/biometric/biometricSlice";
import modSlice from "./features/moderation/modSlice";
import imageSlice from "./features/post/inFeed/large/imageSlice";
import feedSortSlice from "./features/feed/sort/feedSortSlice";

const store = configureStore({
  reducer: {
    post: postSlice,
    comment: commentSlice,
    auth: authSlice,
    community: communitySlice,
    user: userSlice,
    inbox: inboxSlice,
    settings: settingsSlice,
    gesture: gestureSlice,
    appIcon: appIconSlice,
    instances: instancesSlice,
    resolve: resolveSlice,
    biometric: biometricSlice,
    mod: modSlice,
    image: imageSlice,
    feedSort: feedSortSlice,
  },
});
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type Dispatchable<T> =
  | ((val: T) => (dispatch: AppDispatch, getState: () => RootState) => void)
  | ActionCreatorWithPayload<T>;

export default store;

let lastActiveHandle: string | undefined = undefined;
const activeHandleChange = () => {
  const state = store.getState();
  const activeHandle = handleSelector(state);

  if (activeHandle === lastActiveHandle) return;

  lastActiveHandle = activeHandle;

  store.dispatch(getFavoriteCommunities());
  store.dispatch(getBlurNsfw());
  store.dispatch(getFilteredKeywords());
  store.dispatch(getDefaultFeed());
  store.dispatch(getInstances());
};

export function StoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    (async () => {
      try {
        // Load initial settings from DB into the store
        await Promise.all([
          store.dispatch(fetchSettingsFromDatabase()),
          store.dispatch(fetchGesturesFromDatabase()),
          store.dispatch(fetchAppIcon()),
          store.dispatch(initializeBiometricSliceDataIfNeeded()),
        ]);
      } finally {
        // Initialize with current active handle
        activeHandleChange();

        // Subscribe to actions to handle handle changes, this can be used to react to other changes as well
        // to coordinate side effects between slices.
        store.subscribe(activeHandleChange);
      }
    })();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
