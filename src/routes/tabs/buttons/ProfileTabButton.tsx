import { IonIcon, IonLabel } from "@ionic/react";
import { useCallback, useContext, useMemo } from "react";
import { useAppSelector } from "../../../store";
import SharedTabButton, { TabButtonProps } from "./shared";
import { personCircleOutline } from "ionicons/icons";
import { PageContext } from "../../../features/auth/PageContext";
import {
  accountsListEmptySelector,
  userHandleSelector,
} from "../../../features/auth/authSelectors";
import { getProfileTabLabel } from "../../../features/settings/general/other/ProfileTabLabel";
import { styled } from "@linaria/react";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";

const ProfileLabel = styled(IonLabel)`
  max-width: 20vw;
`;

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

  const profileTabLabel = useMemo(
    () => getProfileTabLabel(profileLabelType, userHandle, connectedInstance),
    [profileLabelType, userHandle, connectedInstance],
  );

  const onBeforeBackAction = useCallback(() => {
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
  }, [accountsListEmpty, presentAccountSwitcher, presentLoginIfNeeded, router]);

  const onLongPressOverride = useCallback(() => {
    if (!accountsListEmpty) {
      presentAccountSwitcher();
    } else {
      presentLoginIfNeeded();
    }
  }, [accountsListEmpty, presentAccountSwitcher, presentLoginIfNeeded]);

  return (
    <SharedTabButton
      {...props}
      onBeforeBackAction={onBeforeBackAction}
      onLongPressOverride={onLongPressOverride}
    >
      <IonIcon aria-hidden="true" icon={personCircleOutline} />
      <ProfileLabel>{profileTabLabel}</ProfileLabel>
    </SharedTabButton>
  );
}

/**
 * Signal to Ionic that this is a tab bar button component
 */
ProfileTabButton.isTabButton = true;

export default ProfileTabButton;
