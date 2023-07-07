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
  colorPalette,
  logoGithub,
  mailOutline,
  openOutline,
  reloadCircle,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { useContext, useEffect } from "react";
import { UpdateContext } from "./update/UpdateContext";
import useShouldInstall from "../../features/pwa/useShouldInstall";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

const IconBg = styled.div<{ color: string }>`
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

          <InsetIonItem routerLink="/settings/appearance">
            <IconBg color="color(display-p3 1 0 0)">
              <IonIcon icon={colorPalette} />
            </IconBg>
            <SettingLabel>Appearance</SettingLabel>
          </InsetIonItem>
        </IonList>

        <IonList inset color="primary">
          <InsetIonItem routerLink="/settings/apollo-migrate">
            <IconBg color="color(display-p3 1 0 1)">
              <IonIcon icon={bagCheckOutline} />
            </IconBg>
            <SettingLabel>Migrate Apollo export</SettingLabel>
          </InsetIonItem>
          <InsetIonItem routerLink="/settings/reddit-migrate">
            <IconBg color="color(display-p3 0.5 0 0)">
              <IonIcon icon={bagCheckOutline} />
            </IconBg>
            <SettingLabel>Migrate Reddit export</SettingLabel>
          </InsetIonItem>
        </IonList>

        <IonList inset color="primary">
          <InsetIonItem routerLink="/settings/terms">
            <IonIcon icon={shieldCheckmarkOutline} color="primary" />
            <SettingLabel>Terms &amp; Privacy</SettingLabel>
          </InsetIonItem>
          <InsetIonItem
            href="https://github.com/aeharding/wefwef"
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
          <InsetIonItem href="mailto:hello@wefwef.app">
            <IonIcon icon={mailOutline} color="primary" />
            <SettingLabel>
              Contact us{" "}
              <sup>
                <IonIcon icon={openOutline} color="medium" />
              </sup>
            </SettingLabel>
          </InsetIonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
