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
  bagCheckOutline,
  cog,
  colorPalette,
  gitCompareOutline,
  logoGithub,
  mailOutline,
  openOutline,
  reloadCircle,
  removeCircle,
  returnUpForwardOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { useContext, useEffect } from "react";
import { UpdateContext } from "./update/UpdateContext";
import useShouldInstall from "../../features/pwa/useShouldInstall";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { useAppSelector } from "../../store";
import { handleSelector } from "../../features/auth/authSlice";
import { isNative } from "../../helpers/device";

export const IconBg = styled.div<{ color: string }>`
  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  ion-icon {
    width: 20px;
    height: 20px;
  }

  border-radius: 50%;
  background-color: ${({ color }) => color};
  color: white;
`;

export default function SettingsPage() {
  const { status: updateStatus, checkForUpdates } = useContext(UpdateContext);
  const shouldInstall = useShouldInstall();
  const currentHandle = useAppSelector(handleSelector);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        {!isNative() && (
          <IonList inset color="primary">
            <InsetIonItem routerLink="/settings/install">
              <IconBg color="color(display-p3 0 0.6 1)">
                <IonIcon
                  icon={apps}
                  css={css`
                    padding: 5px;
                  `}
                />
              </IconBg>
              <SettingLabel>Install app</SettingLabel>
              {shouldInstall && <IonBadge color="danger">1</IonBadge>}
            </InsetIonItem>

            <InsetIonItem routerLink="/settings/update">
              <IconBg color="color(display-p3 0 0.8 0)">
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
            <IconBg color="color(display-p3 0.5 0.5 0.5)">
              <IonIcon icon={cog} />
            </IconBg>
            <SettingLabel>General</SettingLabel>
          </InsetIonItem>

          <InsetIonItem routerLink="/settings/appearance">
            <IconBg color="color(display-p3 1 0 0)">
              <IonIcon icon={colorPalette} />
            </IconBg>
            <SettingLabel>Appearance</SettingLabel>
          </InsetIonItem>

          {currentHandle && (
            <InsetIonItem routerLink="/settings/blocks">
              <IconBg color="color(display-p3 0 0.6 1)">
                <IonIcon icon={removeCircle} />
              </IconBg>
              <SettingLabel>Filters & Blocks</SettingLabel>
            </InsetIonItem>
          )}

          <InsetIonItem routerLink="/settings/gestures">
            <IconBg color="color(display-p3 0.95 0.65 0)">
              <IonIcon icon={returnUpForwardOutline} />
            </IconBg>
            <SettingLabel>Gestures</SettingLabel>
          </InsetIonItem>
        </IonList>

        <IonList inset color="primary">
          <InsetIonItem routerLink="/settings/reddit-migrate">
            <IconBg color="color(display-p3 0.7 0 0)">
              <IonIcon icon={bagCheckOutline} />
            </IconBg>
            <SettingLabel>Migrate subreddits</SettingLabel>
          </InsetIonItem>
        </IonList>

        <IonList inset color="primary">
          {!isNative() ? (
            <InsetIonItem routerLink="/settings/terms">
              <IonIcon icon={shieldCheckmarkOutline} color="primary" />
              <SettingLabel>Terms &amp; Privacy</SettingLabel>
            </InsetIonItem>
          ) : undefined}
          <InsetIonItem
            href="https://github.com/aeharding/voyager"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IonIcon icon={logoGithub} color="primary" />
            <SettingLabel>
              Github{" "}
              <sup>
                <IonIcon icon={openOutline} color="medium" />
              </sup>
            </SettingLabel>
          </InsetIonItem>
          <InsetIonItem href="mailto:hello@vger.app">
            <IonIcon icon={mailOutline} color="primary" />
            <SettingLabel>
              Contact us{" "}
              <sup>
                <IonIcon icon={openOutline} color="medium" />
              </sup>
            </SettingLabel>
          </InsetIonItem>
          {isNative() && (
            <InsetIonItem
              href="https://github.com/aeharding/voyager/releases"
              target="_blank"
              rel="noopener noreferrer"
              detail={false}
            >
              <IonIcon icon={gitCompareOutline} color="medium" />
              <SettingLabel>Release</SettingLabel>
              <SettingLabel color="medium" slot="end">
                {APP_VERSION}
              </SettingLabel>
            </InsetIonItem>
          )}
        </IonList>
      </AppContent>
    </IonPage>
  );
}
