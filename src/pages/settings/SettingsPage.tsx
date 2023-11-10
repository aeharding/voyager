import {
  IonBadge,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import { InsetIonItem, SettingLabel } from "../../features/user/Profile";
import {
  apps,
  at,
  bagCheck,
  ban,
  cog,
  colorPalette,
  reloadCircle,
} from "ionicons/icons";
import { useContext, useEffect, useRef } from "react";
import { UpdateContext } from "./update/UpdateContext";
import useShouldInstall from "../../features/pwa/useShouldInstall";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { useAppSelector } from "../../store";
import { handleSelector } from "../../features/auth/authSlice";
import { isNative } from "../../helpers/device";
import { getIconSrc } from "../../features/settings/app-icon/AppIcon";
import { useSetActivePage } from "../../features/auth/AppContext";
import { gesture } from "../../features/icons";

export const IconBg = styled.div<{ color: string; size?: string }>`
  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  ion-icon {
    width: 20px;
    height: 20px;

    ${({ size }) =>
      size &&
      css`
        transform: scale(${size});
      `}
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
  const { status: updateStatus, checkForUpdates } = useContext(UpdateContext);
  const shouldInstall = useShouldInstall();
  const currentHandle = useAppSelector(handleSelector);
  const icon = useAppSelector((state) => state.appIcon.icon);
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        {!isNative() && (
          <IonList inset color="primary">
            <InsetIonItem routerLink="/settings/install">
              <IconBg color="#0e7afe">
                <IonIcon icon={apps} />
              </IconBg>
              <SettingLabel>Install app</SettingLabel>
              {shouldInstall && <IonBadge color="danger">1</IonBadge>}
            </InsetIonItem>

            <InsetIonItem routerLink="/settings/update">
              <IconBg color="color(display-p3 0 0.8 0)" size="1.25">
                <IonIcon icon={reloadCircle} />
              </IconBg>
              <SettingLabel>Check for updates</SettingLabel>
              {updateStatus === "outdated" && (
                <IonBadge color="danger">1</IonBadge>
              )}
            </InsetIonItem>
          </IonList>
        )}
        <IonList inset color="primary">
          <InsetIonItem routerLink="/settings/general">
            <IconBg color="color(display-p3 0.5 0.5 0.5)" size="1.3">
              <IonIcon icon={cog} />
            </IconBg>
            <SettingLabel>General</SettingLabel>
          </InsetIonItem>

          <InsetIonItem routerLink="/settings/appearance">
            <IconBg color="#0e7afe" size="1.2">
              <IonIcon icon={colorPalette} />
            </IconBg>
            <SettingLabel>Appearance</SettingLabel>
          </InsetIonItem>

          {isNative() && (
            <InsetIonItem routerLink="/settings/app-icon">
              <AppIcon src={getIconSrc(icon)} />
              <SettingLabel>App Icon</SettingLabel>
            </InsetIonItem>
          )}

          {currentHandle && (
            <InsetIonItem routerLink="/settings/blocks">
              <IconBg color="color(display-p3 0 0.75 0.3)" size="1.15">
                <IonIcon icon={ban} />
              </IconBg>
              <SettingLabel>Filters & Blocks</SettingLabel>
            </InsetIonItem>
          )}

          <InsetIonItem routerLink="/settings/gestures">
            <IconBg color="color(display-p3 0.55 0.15 1)" size="1.3">
              <IonIcon icon={gesture} />
            </IconBg>
            <SettingLabel>Gestures</SettingLabel>
          </InsetIonItem>
        </IonList>

        <IonList inset color="primary">
          <InsetIonItem routerLink="/settings/reddit-migrate">
            <IconBg color="#ff5700">
              <IonIcon icon={bagCheck} />
            </IconBg>
            <SettingLabel>Migrate subreddits</SettingLabel>
          </InsetIonItem>
        </IonList>

        <IonList inset color="primary">
          <InsetIonItem routerLink="/settings/about/app">
            <IconBg color="#0e7afe" size="1.15">
              <IonIcon icon={at} />
            </IconBg>
            <SettingLabel>About</SettingLabel>
          </InsetIonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
