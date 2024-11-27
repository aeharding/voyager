import { IonIcon, IonLabel } from "@ionic/react";
import { personCircleOutline } from "ionicons/icons";
import { useContext } from "react";

import {
  accountsListEmptySelector,
  userHandleSelector,
} from "#/features/auth/authSelectors";
import { PageContext } from "#/features/auth/PageContext";
import { getProfileTabLabel } from "#/features/settings/general/other/ProfileTabLabel";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppSelector } from "#/store";

import SharedTabButton, { TabButtonProps } from "./shared";

import styles from "./ProfileTabButton.module.css";

function ProfileTabButton(props: TabButtonProps) {
  const router = useOptimizedIonRouter();
  const { presentAccountSwitcher, presentLoginIfNeeded } =
    useContext(PageContext);

  const accountsListEmpty = useAppSelector(accountsListEmptySelector);

  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const userHandle = useAppSelector(userHandleSelector);
  const profileLabelType = useAppSelector(
    (state) => state.settings.appearance.general.profileLabel,
  );

  const profileTabLabel = getProfileTabLabel(
    profileLabelType,
    userHandle,
    connectedInstance,
  );

  function onBeforeBackAction() {
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
  }

  function onLongPressOverride() {
    if (!accountsListEmpty) {
      presentAccountSwitcher();
    } else {
      presentLoginIfNeeded();
    }
  }

  return (
    <SharedTabButton
      {...props}
      onBeforeBackAction={onBeforeBackAction}
      onLongPressOverride={onLongPressOverride}
    >
      <IonIcon aria-hidden="true" icon={personCircleOutline} />
      <IonLabel className={styles.profileLabel}>{profileTabLabel}</IonLabel>
    </SharedTabButton>
  );
}

/**
 * Signal to Ionic that this is a tab bar button component
 */
ProfileTabButton.isTabButton = true;

export default ProfileTabButton;
