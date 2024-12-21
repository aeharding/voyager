import {
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonText,
  IonThumbnail,
} from "@ionic/react";

import { isAndroid } from "#/helpers/device";
import { useAppDispatch, useAppSelector } from "#/store";

import { APP_ICONS, AppIcon, updateAppIcon } from "./appIconSlice";

import styles from "./AppIcon.module.css";

export default function AppIconComponent() {
  const dispatch = useAppDispatch();
  const icon = useAppSelector((state) => state.appIcon.icon);

  function selectIcon(name: AppIcon) {
    dispatch(updateAppIcon(name));
  }

  return (
    <IonRadioGroup value={icon} onIonChange={(e) => selectIcon(e.detail.value)}>
      <IonList inset>
        {APP_ICONS.map((icon) => (
          <IonItem key={icon}>
            <IonThumbnail
              className={styles.thumbnail}
              slot="start"
              onClick={() => selectIcon(icon)}
            >
              <img src={getIconSrc(icon)} className={styles.img} />
            </IonThumbnail>

            <IonRadio value={icon}>
              <IonLabel>
                <h2 className={styles.h2}>
                  {getIconName(icon)}{" "}
                  {isIconThemed(icon) && (
                    <IonBadge color="medium">Themed</IonBadge>
                  )}
                </h2>
                <p className="ion-text-wrap">
                  <IonText color="medium">
                    {getIconAuthor(icon)}{" "}
                    {getThemedIconAuthor(icon) &&
                      `— themed by ${getThemedIconAuthor(icon)}`}
                  </IonText>
                </p>
              </IonLabel>
            </IonRadio>
          </IonItem>
        ))}
      </IonList>
    </IonRadioGroup>
  );
}

export function getIconSrc(icon: AppIcon): string {
  if (icon === "default") return "/logo.png";

  return `/alternateIcons/${icon}.png`;
}

function getIconName(icon: AppIcon): string {
  switch (icon) {
    case "default":
      return "Default";
    case "space":
      return "The Final Frontier";
    case "planetary":
      return "Planetary";
    case "psych":
      return "Psychedelic!";
    case "original":
      return "O.G.";
    case "galactic":
      return "Enter Galactic";
    case "pride":
      return "Progress Pride";
    case "holidays":
      return "Holiday Spirit";
  }
}

function getIconAuthor(icon: AppIcon): string {
  switch (icon) {
    case "default":
    case "planetary":
    case "psych":
    case "pride":
    case "holidays":
      return "fer0n";
    case "space":
      return "ripened_avacado";
    case "original":
      return "nathanielcwm";
    case "galactic":
      return "L1C4U5E";
  }
}

function getThemedIconAuthor(icon: AppIcon): string | undefined {
  if (!isAndroid()) return;

  switch (icon) {
    case "default":
    case "planetary":
      return "Donno";
  }
}

function isIconThemed(icon: AppIcon): boolean {
  if (!isAndroid()) return false;

  switch (icon) {
    case "default":
    case "planetary":
      return true;
    default:
      return false;
  }
}
