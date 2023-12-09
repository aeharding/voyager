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
  handleSelector,
  jwtIssSelector,
  jwtSelector,
} from "./features/auth/authSlice";
import { forwardRef, useContext, useEffect, useMemo } from "react";
import { getDefaultServer } from "./services/app";
import { focusSearchBar } from "./pages/search/SearchPage";
import { useOptimizedIonRouter } from "./helpers/useOptimizedIonRouter";
import { PageContext } from "./features/auth/PageContext";

const Interceptor = styled.div`
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

  const iss = useAppSelector(jwtIssSelector);

  useEffect(() => {
    resetSavedStatusTap();
  }, [location]);

  const { status: updateStatus } = useContext(UpdateContext);
  const shouldInstall = useShouldInstall();

  const { activePageRef } = useContext(AppContext);
  const { presentAccountSwitcher } = useContext(PageContext);

  const jwt = useAppSelector(jwtSelector);
  const totalUnread = useAppSelector(totalUnreadSelector);

  const settingsNotificationCount =
    (shouldInstall ? 1 : 0) + (updateStatus === "outdated" ? 1 : 0);

  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const actor = location.pathname.split("/")[2];

  const userHandle = useAppSelector(handleSelector);
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

  async function onPostsClick() {
    if (!isPostsButtonDisabled) return;

    if (scrollUpIfNeeded(activePageRef?.current)) return;

    if (location.pathname.endsWith(jwt ? "/home" : "/all")) {
      router.push(`/posts/${actor ?? iss ?? getDefaultServer()}`, "back");
      return;
    }

    const communitiesPath = `/posts/${actor ?? iss ?? getDefaultServer()}`;
    if (
      location.pathname === communitiesPath ||
      location.pathname === `${communitiesPath}/`
    )
      return;

    if (router.canGoBack()) {
      router.goBack();
    } else {
      router.push(
        `/posts/${actor ?? iss ?? getDefaultServer()}/${jwt ? "home" : "all"}`,
        "back",
      );
    }
  }

  async function onInboxClick() {
    if (!isInboxButtonDisabled) return;

    if (
      // Messages are in reverse order, so bail on scroll up
      !location.pathname.startsWith("/inbox/messages/") &&
      scrollUpIfNeeded(activePageRef?.current)
    )
      return;

    router.push(`/inbox`, "back");
  }

  async function onProfileClick() {
    if (!isProfileButtonDisabled) return;

    if (scrollUpIfNeeded(activePageRef?.current)) return;

    // if the profile page is already open, show the account switcher
    if (location.pathname === "/profile")
      presentAccountSwitcher({ cssClass: "small" });

    router.push("/profile", "back");
  }

  async function onSearchClick() {
    if (!isSearchButtonDisabled) return;

    // if the search page is already open, focus the search bar
    focusSearchBar();

    if (scrollUpIfNeeded(activePageRef?.current)) return;

    router.push(`/search`, "back");
  }

  async function onSettingsClick() {
    if (!isSettingsButtonDisabled) return;

    if (scrollUpIfNeeded(activePageRef?.current)) return;

    router.push(`/settings`, "back");
  }

  return (
    <IonTabBar {...props} ref={ref}>
      <IonTabButton
        disabled={isPostsButtonDisabled}
        tab="posts"
        href={`/posts/${connectedInstance}`}
      >
        <IonIcon aria-hidden="true" icon={telescope} />
        <IonLabel>Posts</IonLabel>
        <Interceptor onClick={onPostsClick} />
      </IonTabButton>
      <IonTabButton disabled={isInboxButtonDisabled} tab="inbox" href="/inbox">
        <IonIcon aria-hidden="true" icon={fileTray} />
        <IonLabel>Inbox</IonLabel>
        {totalUnread ? (
          <IonBadge color="danger">{totalUnread}</IonBadge>
        ) : undefined}
        <Interceptor onClick={onInboxClick} />
      </IonTabButton>
      <IonTabButton
        disabled={isProfileButtonDisabled}
        tab="profile"
        href="/profile"
      >
        <IonIcon aria-hidden="true" icon={personCircleOutline} />
        <ProfileLabel>{profileTabLabel}</ProfileLabel>
        <Interceptor onClick={onProfileClick} />
      </IonTabButton>
      <IonTabButton
        disabled={isSearchButtonDisabled}
        tab="search"
        href="/search"
      >
        <IonIcon aria-hidden="true" icon={search} />
        <IonLabel>Search</IonLabel>
        <Interceptor onClick={onSearchClick} />
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
        <Interceptor onClick={onSettingsClick} />
      </IonTabButton>
    </IonTabBar>
  );
});

TabBar.isTabBar = true;

export default TabBar;
