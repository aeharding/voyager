import {
  IonBadge,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import { SettingLabel } from "../../../features/user/Profile";
import {
  apps,
  at,
  bagCheck,
  ban,
  cog,
  colorPalette,
  heart,
  pricetag,
  reloadCircle,
} from "ionicons/icons";
import { useContext, useEffect, useRef } from "react";
import { UpdateContext } from "./update/UpdateContext";
import useShouldInstall from "../../../features/pwa/useShouldInstall";
import { useAppDispatch, useAppSelector } from "../../../store";
import { userHandleSelector } from "../../../features/auth/authSelectors";
import {
  isAppleDeviceInstalledToHomescreen,
  isNative,
} from "../../../helpers/device";
import { getIconSrc } from "../../../features/settings/app-icon/AppIcon";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { gesture } from "../../../features/icons";
import TipDialog from "../../../features/tips/TipDialog";
import BiometricIcon from "../../../features/settings/biometric/BiometricIcon";
import {
  biometricSupportedSelector,
  refreshBiometricType,
} from "../../../features/settings/biometric/biometricSlice";
import BiometricTitle from "../../../features/settings/biometric/BiometricTitle";
import usePageVisibility from "../../../helpers/usePageVisibility";
import { styled } from "@linaria/react";
import DatabaseErrorItem from "../../../features/settings/root/DatabaseErrorItem";
import AppHeader from "../../../features/shared/AppHeader";

export const IconBg = styled.div<{ color: string; size?: string }>`
  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  ion-icon {
    width: 20px;
    height: 20px;

    transform: scale(${({ size }) => size || 1});
  }

  border-radius: 50%;
  background-color: ${({ color }) => color};
  color: white;
`;

const AppIcon = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 6px;
`;

export default function SettingsPage() {
  const databaseError = useAppSelector((state) => state.settings.databaseError);
  const { status: updateStatus, checkForUpdates } = useContext(UpdateContext);
  const shouldInstall = useShouldInstall();
  const currentHandle = useAppSelector(userHandleSelector);
  const icon = useAppSelector((state) => state.appIcon.icon);
  const pageRef = useRef<HTMLElement>(null);
  const biometricSupported = useAppSelector(biometricSupportedSelector);
  const dispatch = useAppDispatch();
  const pageVisibility = usePageVisibility();

  const [presentTip, onDismissTip] = useIonModal(TipDialog, {
    onDismiss: (data?: string, role?: string) => onDismissTip(data, role),
  });

  useSetActivePage(pageRef);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  useEffect(() => {
    if (!pageVisibility) return;
    if (!isNative() || !isAppleDeviceInstalledToHomescreen()) return;

    dispatch(refreshBiometricType());
  }, [pageVisibility, dispatch]);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY fullscreen>
        <AppHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </AppHeader>

        {databaseError && <DatabaseErrorItem />}

        <IonList inset>
          <IonItem
            onClick={() => presentTip({ cssClass: "transparent-scroll" })}
            button
            detail
          >
            <IconBg color="color(display-p3 1 0 0)">
              <IonIcon icon={heart} />
            </IconBg>
            <SettingLabel>Support Voyager</SettingLabel>
          </IonItem>
        </IonList>

        {!isNative() && (
          <IonList inset>
            <IonItem routerLink="/settings/install">
              <IconBg color="#0e7afe">
                <IonIcon icon={apps} />
              </IconBg>
              <SettingLabel>Install app</SettingLabel>
              {shouldInstall && <IonBadge color="danger">1</IonBadge>}
            </IonItem>

            <IonItem routerLink="/settings/update">
              <IconBg color="color(display-p3 0 0.8 0)" size="1.25">
                <IonIcon icon={reloadCircle} />
              </IconBg>
              <SettingLabel>Check for updates</SettingLabel>
              {updateStatus === "outdated" && (
                <IonBadge color="danger">1</IonBadge>
              )}
            </IonItem>
          </IonList>
        )}
        <IonList inset>
          <IonItem routerLink="/settings/general">
            <IconBg color="color(display-p3 0.5 0.5 0.5)" size="1.3">
              <IonIcon icon={cog} />
            </IconBg>
            <SettingLabel>General</SettingLabel>
          </IonItem>

          <IonItem routerLink="/settings/appearance">
            <IconBg color="#0e7afe" size="1.2">
              <IonIcon icon={colorPalette} />
            </IconBg>
            <SettingLabel>Appearance</SettingLabel>
          </IonItem>

          {isNative() && (
            <IonItem routerLink="/settings/app-icon">
              <AppIcon src={getIconSrc(icon)} />
              <SettingLabel>App Icon</SettingLabel>
            </IonItem>
          )}

          {biometricSupported && (
            <IonItem routerLink="/settings/biometric">
              <IconBg color="color(display-p3 0.86 0.1 0.2)" size="1.1">
                <BiometricIcon />
              </IconBg>
              <SettingLabel>
                <BiometricTitle />
              </SettingLabel>
            </IonItem>
          )}

          {currentHandle && (
            <IonItem routerLink="/settings/blocks">
              <IconBg color="color(display-p3 0 0.75 0.3)" size="1.15">
                <IonIcon icon={ban} />
              </IconBg>
              <SettingLabel>Filters & Blocks</SettingLabel>
            </IonItem>
          )}

          {currentHandle && (
            <IonItem routerLink="/settings/blocks">
              <IconBg color="color(display-p3 1 0.3 1)" size="1">
                <IonIcon icon={pricetag} />
              </IconBg>
              <SettingLabel>User Tags</SettingLabel>
            </IonItem>
          )}

          <IonItem routerLink="/settings/gestures">
            <IconBg color="color(display-p3 0.55 0.15 1)" size="1.3">
              <IonIcon icon={gesture} />
            </IconBg>
            <SettingLabel>Gestures</SettingLabel>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonItem routerLink="/settings/reddit-migrate">
            <IconBg color="#ff5700">
              <IonIcon icon={bagCheck} />
            </IconBg>
            <SettingLabel>Migrate Subreddits</SettingLabel>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonItem routerLink="/settings/about">
            <IconBg color="#0e7afe" size="1.15">
              <IonIcon icon={at} />
            </IconBg>
            <SettingLabel>About</SettingLabel>
          </IonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
