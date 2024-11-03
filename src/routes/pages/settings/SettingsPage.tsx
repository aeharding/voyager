import {
  IonBadge,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
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
import { styled } from "@linaria/react";
import DatabaseErrorItem from "../../../features/settings/root/DatabaseErrorItem";
import AppHeader from "../../../features/shared/AppHeader";
import { useDocumentVisibility } from "@mantine/hooks";

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
  const documentState = useDocumentVisibility();

  const [presentTip, onDismissTip] = useIonModal(TipDialog, {
    onDismiss: (data?: string, role?: string) => onDismissTip(data, role),
  });

  useSetActivePage(pageRef);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  useEffect(() => {
    if (documentState === "hidden") return;
    if (!isNative() || !isAppleDeviceInstalledToHomescreen()) return;

    dispatch(refreshBiometricType());
  }, [documentState, dispatch]);

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
            <IconBg color="color(display-p3 1 0 0)" slot="start">
              <IonIcon icon={heart} />
            </IconBg>
            <IonLabel className="ion-text-nowrap">Support Voyager</IonLabel>
          </IonItem>
        </IonList>

        {!isNative() && (
          <IonList inset>
            <IonItem routerLink="/settings/install">
              <IconBg color="#0e7afe" slot="start">
                <IonIcon icon={apps} />
              </IconBg>
              <IonLabel className="ion-text-nowrap">Install app</IonLabel>
              {shouldInstall && <IonBadge color="danger">1</IonBadge>}
            </IonItem>

            <IonItem routerLink="/settings/update">
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
          <IonItem routerLink="/settings/general">
            <IconBg
              color="color(display-p3 0.5 0.5 0.5)"
              size="1.3"
              slot="start"
            >
              <IonIcon icon={cog} />
            </IconBg>
            <IonLabel className="ion-text-nowrap">General</IonLabel>
          </IonItem>

          <IonItem routerLink="/settings/appearance">
            <IconBg color="#0e7afe" size="1.2" slot="start">
              <IonIcon icon={colorPalette} />
            </IconBg>
            <IonLabel className="ion-text-nowrap">Appearance</IonLabel>
          </IonItem>

          {isNative() && (
            <IonItem routerLink="/settings/app-icon">
              <AppIcon src={getIconSrc(icon)} slot="start" />
              <IonLabel className="ion-text-nowrap">App Icon</IonLabel>
            </IonItem>
          )}

          {biometricSupported && (
            <IonItem routerLink="/settings/biometric">
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
            <IonItem routerLink="/settings/blocks">
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

          {currentHandle && (
            <IonItem routerLink="/settings/tags">
              <IconBg color="color(display-p3 1 0.3 1)" size="1" slot="start">
                <IonIcon icon={pricetag} />
              </IconBg>
              <IonLabel className="ion-text-nowrap">User Tags</IonLabel>
            </IonItem>
          )}

          <IonItem routerLink="/settings/gestures">
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
          <IonItem routerLink="/settings/reddit-migrate">
            <IconBg color="#ff5700" slot="start">
              <IonIcon icon={bagCheck} />
            </IconBg>
            <IonLabel className="ion-text-nowrap">Migrate Subreddits</IonLabel>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonItem routerLink="/settings/about">
            <IconBg color="#0e7afe" size="1.15" slot="start">
              <IonIcon icon={at} />
            </IconBg>
            <IonLabel className="ion-text-nowrap">About</IonLabel>
          </IonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
