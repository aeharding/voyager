/* eslint perfectionist/sort-objects: ["warn", { partitionByNewLine: true }] */

import { ActionCreatorWithPayload, configureStore } from "@reduxjs/toolkit";
import { useEffect, useRef } from "react";
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";

import networkSlice from "./core/listeners/network/networkSlice";
import { handleSelector } from "./features/auth/authSelectors";
import authSlice from "./features/auth/authSlice";
import joinSlice from "./features/auth/login/join/joinSlice";
import pickJoinServerSlice from "./features/auth/login/pickJoinServer/pickJoinServerSlice";
import siteSlice from "./features/auth/siteSlice";
import commentSlice from "./features/comment/commentSlice";
import communitySlice, {
  getFavoriteCommunities,
} from "./features/community/communitySlice";
import deepLinkReadySlice from "./features/community/list/deepLinkReadySlice";
import feedSortSlice from "./features/feed/sort/feedSortSlice";
import inboxSlice from "./features/inbox/inboxSlice";
import instancesSlice, {
  getInstances,
} from "./features/instances/instancesSlice";
import redgifsSlice from "./features/media/external/redgifs/redgifsSlice";
import imageSlice from "./features/media/imageSlice";
import migrationSlice from "./features/migrate/migrationSlice";
import modSlice from "./features/moderation/modSlice";
import postAppearanceSlice from "./features/post/appearance/appearanceSlice";
import thumbnailSlice from "./features/post/link/thumbnail/thumbnailSlice";
import postSlice from "./features/post/postSlice";
import resolveSlice from "./features/resolve/resolveSlice";
import appIconSlice, {
  fetchAppIcon,
} from "./features/settings/appIcon/appIconSlice";
import biometricSlice, {
  initializeBiometricSliceDataIfNeeded,
} from "./features/settings/biometric/biometricSlice";
import gestureSlice, {
  fetchGesturesFromDatabase,
} from "./features/settings/gestures/gestureSlice";
import settingsSlice, {
  fetchSettingsFromDatabase,
  getBlurNsfw,
  getDefaultFeed,
  getFilteredKeywords,
  getFilteredWebsites,
} from "./features/settings/settingsSlice";
import spoilerSlice from "./features/shared/markdown/components/spoiler/spoilerSlice";
import uploadImageSlice from "./features/shared/markdown/editing/uploadImageSlice";
import userTagSlice from "./features/tags/userTagSlice";
import userSlice from "./features/user/userSlice";

const store = configureStore({
  reducer: {
    appIcon: appIconSlice,
    auth: authSlice,
    biometric: biometricSlice,
    comment: commentSlice,
    community: communitySlice,
    deepLinkReady: deepLinkReadySlice,
    feedSort: feedSortSlice,
    gesture: gestureSlice,
    image: imageSlice,
    inbox: inboxSlice,
    instances: instancesSlice,
    join: joinSlice,
    migration: migrationSlice,
    mod: modSlice,
    network: networkSlice,
    pickJoinServer: pickJoinServerSlice,
    post: postSlice,
    postAppearance: postAppearanceSlice,
    redgifs: redgifsSlice,
    resolve: resolveSlice,
    settings: settingsSlice,
    site: siteSlice,
    spoiler: spoilerSlice,
    thumbnail: thumbnailSlice,
    uploadImage: uploadImageSlice,
    user: userSlice,
    userTag: userTagSlice,
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

export function StoreProvider({ children }: React.PropsWithChildren) {
  return (
    <Provider store={store}>
      <SetupStore />
      {children}
    </Provider>
  );
}

function SetupStore() {
  const dispatch = useAppDispatch();
  const activeAccount = useAppSelector(handleSelector);
  const needsSetupRef = useRef(true);

  useEffect(() => {
    if (!needsSetupRef.current) {
      afterSetup();
      return;
    }

    // Load initial settings from DB into the store
    // Only runs once at startup!
    Promise.all([
      store.dispatch(fetchSettingsFromDatabase()),
      store.dispatch(fetchGesturesFromDatabase()),
      store.dispatch(fetchAppIcon()),
      store.dispatch(initializeBiometricSliceDataIfNeeded()),
    ]).finally(afterSetup);

    // Runs after every active account change
    function afterSetup() {
      needsSetupRef.current = false;
      dispatch(getFavoriteCommunities());
      dispatch(getBlurNsfw());
      dispatch(getFilteredKeywords());
      dispatch(getFilteredWebsites());
      dispatch(getDefaultFeed());
      dispatch(getInstances());
    }
  }, [activeAccount, dispatch]);

  return null;
}
