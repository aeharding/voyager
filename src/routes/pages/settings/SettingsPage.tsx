import {
  IonBadge,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import { useDocumentVisibility } from "@mantine/hooks";
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
import React, { use, useEffect } from "react";

import { userHandleSelector } from "#/features/auth/authSelectors";
import { gesture } from "#/features/icons";
import useShouldInstall from "#/features/pwa/useShouldInstall";
import { getIconSrc } from "#/features/settings/appIcon/AppIcon";
import BiometricIcon from "#/features/settings/biometric/BiometricIcon";
import {
  biometricSupportedSelector,
  refreshBiometricType,
} from "#/features/settings/biometric/biometricSlice";
import BiometricTitle from "#/features/settings/biometric/BiometricTitle";
import DatabaseErrorItem from "#/features/settings/root/DatabaseErrorItem";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import TipDialog from "#/features/tips/TipDialog";
import { AppPage } from "#/helpers/AppPage";
import { sv } from "#/helpers/css";
import { isAppleDeviceInstalledToHomescreen, isNative } from "#/helpers/device";
import { useAppDispatch, useAppSelector } from "#/store";

import { UpdateContext } from "./update/UpdateContext";

import styles from "./SettingsPage.module.css";

interface IconBgProps extends React.PropsWithChildren {
  color: string;
  size?: string;
  slot?: string;
}

export function IconBg({ color, size, children, slot }: IconBgProps) {
  return (
    <div
      className={styles.iconBg}
      style={sv({ color, scale: size })}
      slot={slot}
    >
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const databaseError = useAppSelector((state) => state.settings.databaseError);
  const { status: updateStatus, checkForUpdates } = use(UpdateContext);
  const shouldInstall = useShouldInstall();
  const currentHandle = useAppSelector(userHandleSelector);
  const icon = useAppSelector((state) => state.appIcon.icon);
  const biometricSupported = useAppSelector(biometricSupportedSelector);
  const dispatch = useAppDispatch();
  const documentState = useDocumentVisibility();

  const [presentTip, onDismissTip] = useIonModal(TipDialog, {
    onDismiss: (data?: string, role?: string) => onDismissTip(data, role),
  });

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  useEffect(() => {
    if (documentState === "hidden") return;
    if (!isNative() || !isAppleDeviceInstalledToHomescreen()) return;

    dispatch(refreshBiometricType());
  }, [documentState, dispatch]);

  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY fullscreen color="light-bg">
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
            <IconBg color="color(display-p3 1 0 0)" slot="start">
              <IonIcon icon={heart} />
            </IconBg>
            <IonLabel className="ion-text-nowrap">Support Voyager</IonLabel>
          </IonItem>
        </IonList>

        {!isNative() && (
          <IonList inset>
            <IonItem routerLink="/settings/install" button detail>
              <IconBg color="#0e7afe" slot="start">
                <IonIcon icon={apps} />
              </IconBg>
              <IonLabel className="ion-text-nowrap">Install app</IonLabel>
              {shouldInstall && <IonBadge color="danger">1</IonBadge>}
            </IonItem>

            <IonItem routerLink="/settings/update" button detail>
              <IconBg
                color="color(display-p3 0 0.8 0)"
                size="1.25"
                slot="start"
              >
                <IonIcon icon={reloadCircle} />
              </IconBg>
              <IonLabel className="ion-text-nowrap">Check for updates</IonLabel>
              {updateStatus === "outdated" && (
                <IonBadge color="danger">1</IonBadge>
              )}
            </IonItem>
          </IonList>
        )}
        <IonList inset>
          <IonItem routerLink="/settings/general" button detail>
            <IconBg
              color="color(display-p3 0.5 0.5 0.5)"
              size="1.3"
              slot="start"
            >
              <IonIcon icon={cog} />
            </IconBg>
            <IonLabel className="ion-text-nowrap">General</IonLabel>
          </IonItem>

          <IonItem routerLink="/settings/appearance" button detail>
            <IconBg color="#0e7afe" size="1.2" slot="start">
              <IonIcon icon={colorPalette} />
            </IconBg>
            <IonLabel className="ion-text-nowrap">Appearance</IonLabel>
          </IonItem>

          {isNative() && (
            <IonItem routerLink="/settings/app-icon" button detail>
              <img
                src={getIconSrc(icon)}
                slot="start"
                className={styles.appIcon}
              />
              <IonLabel className="ion-text-nowrap">App Icon</IonLabel>
            </IonItem>
          )}

          {biometricSupported && (
            <IonItem routerLink="/settings/biometric" button detail>
              <IconBg
                color="color(display-p3 0.86 0.1 0.2)"
                size="1.1"
                slot="start"
              >
                <BiometricIcon />
              </IconBg>
              <IonLabel className="ion-text-nowrap">
                <BiometricTitle />
              </IonLabel>
            </IonItem>
          )}

          {currentHandle && (
            <IonItem routerLink="/settings/blocks" button detail>
              <IconBg
                color="color(display-p3 0 0.75 0.3)"
                size="1.15"
                slot="start"
              >
                <IonIcon icon={ban} />
              </IconBg>
              <IonLabel className="ion-text-nowrap">Filters & Blocks</IonLabel>
            </IonItem>
          )}

          <IonItem routerLink="/settings/tags" button detail>
            <IconBg color="color(display-p3 1 0.3 1)" size="1" slot="start">
              <IonIcon icon={pricetag} />
            </IconBg>
            <IonLabel className="ion-text-nowrap">User Tags</IonLabel>
          </IonItem>

          <IonItem routerLink="/settings/gestures" button detail>
            <IconBg
              color="color(display-p3 0.55 0.15 1)"
              size="1.3"
              slot="start"
            >
              <IonIcon icon={gesture} />
            </IconBg>
            <IonLabel className="ion-text-nowrap">Gestures</IonLabel>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonItem routerLink="/settings/reddit-migrate" button detail>
            <IconBg color="#ff5700" slot="start">
              <IonIcon icon={bagCheck} />
            </IconBg>
            <IonLabel className="ion-text-nowrap">Migrate Subreddits</IonLabel>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonItem routerLink="/settings/about" button detail>
            <IconBg color="#0e7afe" size="1.15" slot="start">
              <IonIcon icon={at} />
            </IconBg>
            <IonLabel className="ion-text-nowrap">About</IonLabel>
          </IonItem>
        </IonList>
      </AppContent>
    </AppPage>
  );
}
