import { ReactNode, useEffect } from "react";
import { ActionCreatorWithPayload, configureStore } from "@reduxjs/toolkit";
import postSlice from "./features/post/postSlice";
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import authSlice from "./features/auth/authSlice";
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
import migrationSlice from "./features/migrate/migrationSlice";
import modSlice from "./features/moderation/modSlice";
import imageSlice from "./features/post/inFeed/large/imageSlice";
import feedSortSlice from "./features/feed/sort/feedSortSlice";
import siteSlice from "./features/auth/siteSlice";
import { handleSelector } from "./features/auth/authSelectors";
import pickJoinServerSlice from "./features/auth/login/pickJoinServer/pickJoinServerSlice";
import joinSlice from "./features/auth/login/join/joinSlice";
import networkSlice from "./core/listeners/network/networkSlice";
import spoilerSlice from "./features/shared/markdown/components/spoiler/spoilerSlice";
import deepLinkReadySlice from "./features/community/list/deepLinkReadySlice";
import redgifsSlice from "./features/media/external/redgifs/redgifsSlice";
import uploadImageSlice from "./features/shared/markdown/editing/uploadImageSlice";
import postAppearanceSlice from "./features/post/appearance/appearanceSlice";
import thumbnailSlice from "./features/post/link/thumbnail/thumbnailSlice";

const store = configureStore({
  reducer: {
    post: postSlice,
    comment: commentSlice,
    auth: authSlice,
    site: siteSlice,
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
    pickJoinServer: pickJoinServerSlice,
    join: joinSlice,
    network: networkSlice,
    migration: migrationSlice,
    spoiler: spoilerSlice,
    deepLinkReady: deepLinkReadySlice,
    redgifs: redgifsSlice,
    uploadImage: uploadImageSlice,
    postAppearance: postAppearanceSlice,
    thumbnail: thumbnailSlice,
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

// "uninitialized" so that "uninitialized" -> undefined (logged out) triggers change
let lastActiveHandle: string | undefined = "uninitialized";
const activeHandleChange = () => {
  const state = store.getState();
  const handle = handleSelector(state);

  if (handle === lastActiveHandle) return;

  lastActiveHandle = handle;

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
