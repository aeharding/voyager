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
  logoGithub,
  mailOutline,
  openOutline,
  reload,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { isInstalled } from "../../helpers/device";
import { useContext, useEffect } from "react";
import { UpdateContext } from "./update/UpdateContext";

export default function SettingsPage() {
  const { status: updateStatus, checkForUpdates } = useContext(UpdateContext);

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
            <IonIcon icon={apps} color="primary" />
            <SettingLabel>Install app</SettingLabel>
            {!isInstalled() && <IonBadge color="danger">1</IonBadge>}
          </InsetIonItem>
          <InsetIonItem routerLink="/settings/update">
            <IonIcon icon={reload} color="primary" />
            <SettingLabel>Check for updates</SettingLabel>
            {updateStatus === "outdated" && (
              <IonBadge color="danger">1</IonBadge>
            )}
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
