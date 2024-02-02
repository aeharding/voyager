import styled from "@emotion/styled";
import {
  personCircleOutline,
  cog,
  search,
  fileTray,
  telescope,
} from "ionicons/icons";
import {
  IonBadge,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
} from "@ionic/react";
import { totalUnreadSelector } from "./features/inbox/inboxSlice";
import useShouldInstall from "./features/pwa/useShouldInstall";
import { UpdateContext } from "./pages/settings/update/UpdateContext";
import { scrollUpIfNeeded } from "./helpers/scrollUpIfNeeded";
import { getProfileTabLabel } from "./features/settings/general/other/ProfileTabLabel";
import { AppContext } from "./features/auth/AppContext";
import { resetSavedStatusTap } from "./listeners/statusTap";
import { useLocation } from "react-router";
import { useAppSelector } from "./store";
import {
  userHandleSelector,
  instanceSelector,
  jwtSelector,
  accountsListEmptySelector,
} from "./features/auth/authSelectors";
import { forwardRef, useCallback, useContext, useEffect, useMemo } from "react";
import { getDefaultServer } from "./services/app";
import { focusSearchBar } from "./pages/search/SearchPage";
import { useOptimizedIonRouter } from "./helpers/useOptimizedIonRouter";
import { PageContext } from "./features/auth/PageContext";
import { useLongPress } from "use-long-press";
import { ImpactStyle } from "@capacitor/haptics";
import useHapticFeedback from "./helpers/useHapticFeedback";
import { css } from "@emotion/react";

const interceptorCss = css`
  position: absolute;
  inset: 0;
  pointer-events: all;
`;

const ProfileLabel = styled(IonLabel)`
  max-width: 20vw;
`;

type CustomTabBarType = typeof IonTabBar & {
  /**
   * Signal to Ionic that this is a tab bar component
   */
  isTabBar?: boolean;
};

const TabBar: CustomTabBarType = forwardRef(function TabBar(props, ref) {
  const location = useLocation();
  const router = useOptimizedIonRouter();
  const vibrate = useHapticFeedback();

  const selectedInstance = useAppSelector(instanceSelector);

  useEffect(() => {
    resetSavedStatusTap();
  }, [location]);

  const { status: updateStatus } = useContext(UpdateContext);
  const shouldInstall = useShouldInstall();

  const { activePageRef } = useContext(AppContext);
  const { presentAccountSwitcher, presentLoginIfNeeded } =
    useContext(PageContext);

  const jwt = useAppSelector(jwtSelector);
  const accountsListEmpty = useAppSelector(accountsListEmptySelector);
  const totalUnread = useAppSelector(totalUnreadSelector);

  const settingsNotificationCount =
    (shouldInstall ? 1 : 0) + (updateStatus === "outdated" ? 1 : 0);

  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const userHandle = useAppSelector(userHandleSelector);
  const profileLabelType = useAppSelector(
    (state) => state.settings.appearance.general.profileLabel,
  );

  const profileTabLabel = useMemo(
    () => getProfileTabLabel(profileLabelType, userHandle, connectedInstance),
    [profileLabelType, userHandle, connectedInstance],
  );

  const isPostsButtonDisabled = location.pathname.startsWith("/posts");
  const isInboxButtonDisabled = location.pathname.startsWith("/inbox");
  const isProfileButtonDisabled = location.pathname.startsWith("/profile");
  const isSearchButtonDisabled = location.pathname.startsWith("/search");
  const isSettingsButtonDisabled = location.pathname.startsWith("/settings");

  const onPostsClick = useCallback(() => {
    if (!isPostsButtonDisabled) return;

    if (scrollUpIfNeeded(activePageRef?.current)) return;

    const pathname = router.getRouteInfo()?.pathname;
    if (!pathname) return;

    const actor = pathname.split("/")[2];

    if (pathname.endsWith(jwt ? "/home" : "/all")) {
      router.push(
        `/posts/${actor ?? selectedInstance ?? getDefaultServer()}`,
        "back",
      );
      return;
    }

    const communitiesPath = `/posts/${
      actor ?? selectedInstance ?? getDefaultServer()
    }`;
    if (pathname === communitiesPath || pathname === `${communitiesPath}/`)
      return;

    if (router.canGoBack()) {
      router.goBack();
    } else {
      router.push(
        `/posts/${actor ?? selectedInstance ?? getDefaultServer()}/${
          jwt ? "home" : "all"
        }`,
        "back",
      );
    }
  }, [activePageRef, isPostsButtonDisabled, jwt, router, selectedInstance]);

  const onInboxClick = useCallback(() => {
    if (!isInboxButtonDisabled) return;

    const pathname = router.getRouteInfo()?.pathname;
    if (!pathname) return;

    if (
      // Messages are in reverse order, so bail on scroll up
      !pathname.startsWith("/inbox/messages/") &&
      scrollUpIfNeeded(activePageRef?.current)
    )
      return;

    router.push(`/inbox`, "back");
  }, [activePageRef, isInboxButtonDisabled, router]);

  const onProfileClick = useCallback(() => {
    if (!isProfileButtonDisabled) return;

    if (scrollUpIfNeeded(activePageRef?.current)) return;

    const pathname = router.getRouteInfo()?.pathname;
    if (!pathname) return;

    // if the profile page is already open, show the account switcher
    if (pathname === "/profile") {
      if (!accountsListEmpty) {
        presentAccountSwitcher();
      } else {
        presentLoginIfNeeded();
      }
    }

    router.push("/profile", "back");
  }, [
    accountsListEmpty,
    activePageRef,
    isProfileButtonDisabled,
    presentAccountSwitcher,
    presentLoginIfNeeded,
    router,
  ]);

  const onSearchClick = useCallback(() => {
    if (!isSearchButtonDisabled) return;

    // if the search page is already open, focus the search bar
    focusSearchBar();

    if (scrollUpIfNeeded(activePageRef?.current)) return;

    router.push(`/search`, "back");
  }, [activePageRef, isSearchButtonDisabled, router]);

  const onSettingsClick = useCallback(() => {
    if (!isSettingsButtonDisabled) return;

    if (scrollUpIfNeeded(activePageRef?.current)) return;

    router.push(`/settings`, "back");
  }, [activePageRef, isSettingsButtonDisabled, router]);

  const onPresentAccountSwitcher = useCallback(() => {
    vibrate({ style: ImpactStyle.Light });

    if (!accountsListEmpty) {
      presentAccountSwitcher();
    } else {
      presentLoginIfNeeded();
    }
  }, [
    accountsListEmpty,
    presentAccountSwitcher,
    presentLoginIfNeeded,
    vibrate,
  ]);

  const presentAccountSwitcherBind = useLongPress(onPresentAccountSwitcher);

  return (
    <IonTabBar {...props} ref={ref}>
      <IonTabButton disabled={isPostsButtonDisabled} tab="posts" href="/posts">
        <IonIcon aria-hidden="true" icon={telescope} />
        <IonLabel>Posts</IonLabel>
        <div onClick={onPostsClick} css={interceptorCss} />
      </IonTabButton>
      <IonTabButton disabled={isInboxButtonDisabled} tab="inbox" href="/inbox">
        <IonIcon aria-hidden="true" icon={fileTray} />
        <IonLabel>Inbox</IonLabel>
        {totalUnread ? (
          <IonBadge color="danger">{totalUnread}</IonBadge>
        ) : undefined}
        <div onClick={onInboxClick} css={interceptorCss} />
      </IonTabButton>
      <IonTabButton
        disabled={isProfileButtonDisabled}
        tab="profile"
        href="/profile"
      >
        <IonIcon aria-hidden="true" icon={personCircleOutline} />
        <ProfileLabel>{profileTabLabel}</ProfileLabel>
        <div
          onClick={onProfileClick}
          {...presentAccountSwitcherBind()}
          css={interceptorCss}
        />
      </IonTabButton>
      <IonTabButton
        disabled={isSearchButtonDisabled}
        tab="search"
        href="/search"
      >
        <IonIcon aria-hidden="true" icon={search} />
        <IonLabel>Search</IonLabel>
        <div onClick={onSearchClick} css={interceptorCss} />
      </IonTabButton>
      <IonTabButton
        tab="settings"
        href="/settings"
        disabled={isSettingsButtonDisabled}
      >
        <IonIcon aria-hidden="true" icon={cog} />
        <IonLabel>Settings</IonLabel>
        {settingsNotificationCount ? (
          <IonBadge color="danger">{settingsNotificationCount}</IonBadge>
        ) : undefined}
        <div onClick={onSettingsClick} css={interceptorCss} />
      </IonTabButton>
    </IonTabBar>
  );
});

TabBar.isTabBar = true;

export default TabBar;
