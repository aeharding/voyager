import {
  personCircleOutline,
  search,
  fileTray,
  telescope,
  cog,
} from "ionicons/icons";
import {
  IonBadge,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
} from "@ionic/react";
import { totalUnreadSelector } from "../features/inbox/inboxSlice";
import useShouldInstall from "../features/pwa/useShouldInstall";
import { UpdateContext } from "./pages/settings/update/UpdateContext";
import { scrollUpIfNeeded } from "../helpers/scrollUpIfNeeded";
import { getProfileTabLabel } from "../features/settings/general/other/ProfileTabLabel";
import { AppContext } from "../features/auth/AppContext";
import { useAppSelector } from "../store";
import {
  userHandleSelector,
  instanceSelector,
  jwtSelector,
  accountsListEmptySelector,
} from "../features/auth/authSelectors";
import { forwardRef, useCallback, useContext, useMemo, useRef } from "react";
import { getDefaultServer } from "../services/app";
import { focusSearchBar } from "./pages/search/SearchPage";
import { useOptimizedIonRouter } from "../helpers/useOptimizedIonRouter";
import { PageContext } from "../features/auth/PageContext";
import { LongPressReactEvents, useLongPress } from "use-long-press";
import { ImpactStyle } from "@capacitor/haptics";
import useHapticFeedback from "../helpers/useHapticFeedback";
import { styled } from "@linaria/react";

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
  const longPressedRef = useRef(false);

  const router = useOptimizedIonRouter();
  const vibrate = useHapticFeedback();

  const databaseError = useAppSelector((state) => state.settings.databaseError);
  const selectedInstance = useAppSelector(instanceSelector);

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

  const onPostsClick = useCallback(
    (e: CustomEvent) => {
      if (longPressedRef.current) {
        e.preventDefault();
        longPressedRef.current = false;
        return;
      }

      if (!router.getRouteInfo()?.pathname.startsWith("/posts")) return;
      e.preventDefault();

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
    },
    [activePageRef, jwt, router, selectedInstance],
  );

  const onInboxClick = useCallback(
    (e: CustomEvent) => {
      if (longPressedRef.current) {
        e.preventDefault();
        longPressedRef.current = false;
        return;
      }

      if (!router.getRouteInfo()?.pathname.startsWith("/inbox")) return;
      e.preventDefault();

      const pathname = router.getRouteInfo()?.pathname;
      if (!pathname) return;

      if (
        // Messages are in reverse order, so bail on scroll up
        !pathname.startsWith("/inbox/messages/") &&
        scrollUpIfNeeded(activePageRef?.current)
      )
        return;

      router.push(`/inbox`, "back");
    },
    [activePageRef, router],
  );

  const onProfileClick = useCallback(
    (e: CustomEvent) => {
      if (!router.getRouteInfo()?.pathname.startsWith("/profile")) return;
      e.preventDefault();

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
    },
    [
      accountsListEmpty,
      activePageRef,
      presentAccountSwitcher,
      presentLoginIfNeeded,
      router,
    ],
  );

  const onSearchClick = useCallback(
    (e: CustomEvent) => {
      if (longPressedRef.current) {
        e.preventDefault();
        return;
      }

      if (!router.getRouteInfo()?.pathname.startsWith("/search")) return;
      e.preventDefault();

      // if the search page is already open, focus the search bar
      focusSearchBar();

      if (scrollUpIfNeeded(activePageRef?.current)) return;

      router.push(`/search`, "back");
    },
    [activePageRef, router],
  );

  const onSettingsClick = useCallback(
    (e: CustomEvent) => {
      if (longPressedRef.current) {
        e.preventDefault();
        return;
      }

      if (!router.getRouteInfo()?.pathname.startsWith("/settings")) return;
      e.preventDefault();

      if (scrollUpIfNeeded(activePageRef?.current)) return;

      router.push(`/settings`, "back");
    },
    [activePageRef, router],
  );

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

  // Except profile switcher, since it presents overlay this hack is not needed
  const tabLongPressSettings = useMemo(
    () => ({
      onFinish: () => {
        setTimeout(() => {
          longPressedRef.current = false;
        }, 200);
      },
    }),
    [],
  );

  const onLongPressInbox = useCallback(
    (e: LongPressReactEvents) => {
      vibrate({ style: ImpactStyle.Light });

      if (!router.getRouteInfo()?.pathname.startsWith("/inbox")) {
        if (e.target instanceof HTMLElement) e.target.click();
      }

      // order matters- set after target.click()
      longPressedRef.current = true;
    },
    [router, vibrate],
  );

  const longPressInboxBind = useLongPress(
    onLongPressInbox,
    tabLongPressSettings,
  );

  const onLongPressSearch = useCallback(
    (e: LongPressReactEvents) => {
      vibrate({ style: ImpactStyle.Light });

      if (!router.getRouteInfo()?.pathname.startsWith("/search")) {
        if (e.target instanceof HTMLElement) e.target.click();
      }

      // order matters- set after target.click()
      longPressedRef.current = true;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            focusSearchBar();
          });
        });
      });
    },
    [router, vibrate],
  );

  const longPressSearchBind = useLongPress(
    onLongPressSearch,
    tabLongPressSettings,
  );

  const onLongPressSettings = useCallback(
    (e: LongPressReactEvents) => {
      vibrate({ style: ImpactStyle.Light });

      if (!router.getRouteInfo()?.pathname.startsWith("/settings")) {
        if (e.target instanceof HTMLElement) e.target.click();
      }

      // order matters- set after target.click()
      longPressedRef.current = true;
    },
    [router, vibrate],
  );

  const longPressSettingsBind = useLongPress(
    onLongPressSettings,
    tabLongPressSettings,
  );

  const settingsBadge = (() => {
    if (databaseError) return <IonBadge color="danger">!</IonBadge>;

    if (settingsNotificationCount)
      return <IonBadge color="danger">{settingsNotificationCount}</IonBadge>;
  })();

  const resetLongPress = () => {
    longPressedRef.current = false;
  };

  return (
    <IonTabBar {...props} ref={ref} onClick={resetLongPress}>
      <IonTabButton tab="posts" href="/posts" onClick={onPostsClick}>
        <IonIcon aria-hidden="true" icon={telescope} />
        <IonLabel>Posts</IonLabel>
      </IonTabButton>
      <IonTabButton
        tab="inbox"
        href="/inbox"
        onClick={onInboxClick}
        {...longPressInboxBind()}
      >
        <IonIcon aria-hidden="true" icon={fileTray} />
        <IonLabel>Inbox</IonLabel>
        {totalUnread ? (
          <IonBadge color="danger">{totalUnread}</IonBadge>
        ) : undefined}
      </IonTabButton>
      <IonTabButton
        tab="profile"
        href="/profile"
        onClick={onProfileClick}
        {...presentAccountSwitcherBind()}
      >
        <IonIcon aria-hidden="true" icon={personCircleOutline} />
        <ProfileLabel>{profileTabLabel}</ProfileLabel>
      </IonTabButton>
      <IonTabButton
        tab="search"
        href="/search"
        onClick={onSearchClick}
        {...longPressSearchBind()}
      >
        <IonIcon aria-hidden="true" icon={search} />
        <IonLabel>Search</IonLabel>
      </IonTabButton>
      <IonTabButton
        tab="settings"
        href="/settings"
        onClick={onSettingsClick}
        {...longPressSettingsBind()}
      >
        <IonIcon aria-hidden="true" icon={cog} />
        <IonLabel>Settings</IonLabel>
        {settingsBadge}
      </IonTabButton>
    </IonTabBar>
  );
});

TabBar.isTabBar = true;

export default TabBar;
