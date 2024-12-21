import {
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  useIonAlert,
} from "@ionic/react";
import { capitalize } from "es-toolkit";

import { useIsDark } from "#/core/GlobalStyles";
import { getTheme } from "#/core/theme/AppThemes";
import { ListHeader } from "#/features/settings/shared/formatting";
import { AppThemeType, OAppThemeType } from "#/services/db";
import { useAppDispatch, useAppSelector } from "#/store";

import { setTheme } from "../../../settingsSlice";
import AppThemePreview from "./AppThemePreview";

import styles from "./AppTheme.module.css";

export default function AppTheme() {
  const theme = useAppSelector((state) => state.settings.appearance.theme);
  const isDark = useIsDark();
  const dispatch = useAppDispatch();
  const [presentAlert] = useIonAlert();

  function onChangeTheme(themeName: AppThemeType) {
    dispatch(setTheme(themeName));

    const theme = getTheme(themeName);

    if (theme.dark.background && !theme.light.background && !isDark) {
      presentAlert({
        header: `${capitalize(themeName)} Looks Best Dark`,
        message: `Just as a heads up, you're in the light theme currently but ${capitalize(
          themeName,
        )} looks best with a darker theme. You might want to change it to get the full effect, or you do you!`,
        buttons: ["OK"],
      });
    }
  }

  return (
    <>
      <ListHeader>
        <IonLabel>App Theme</IonLabel>
      </ListHeader>
      <IonRadioGroup
        value={theme}
        onIonChange={(e) => onChangeTheme(e.detail.value)}
      >
        <IonList inset>
          {Object.values(OAppThemeType).map((theme) => (
            <IonItem key={theme}>
              <AppThemePreview slot="start" appTheme={theme} />

              <IonRadio value={theme}>
                <IonLabel>
                  <div>{getThemeName(theme)}</div>
                  <div className={styles.description}>
                    {getThemeDescription(theme)}
                  </div>
                </IonLabel>
              </IonRadio>
            </IonItem>
          ))}
        </IonList>
      </IonRadioGroup>
    </>
  );
}

function getThemeName(appTheme: AppThemeType): string {
  switch (appTheme) {
    case "default":
      return "Default";
    case "mario":
      return "Fiery Mario";
    case "pistachio":
      return "Pistachio";
    case "pumpkin":
      return "Pumpkin";
    case "uv":
      return "Ultraviolet";
    case "mint":
      return "Mint";
    case "dracula":
      return "Dracula";
    case "tangerine":
      return "Tangerine";
    case "sunset":
      return "Sunset";
    case "outrun":
      return "Outrun";
  }
}

function getThemeDescription(appTheme: AppThemeType): string {
  switch (appTheme) {
    case "default":
      return "Always blue! Always blue! Always blue!";
    case "mario":
      return "should've been in the movie.";
    case "pistachio":
      return "Now I want some baklava...";
    case "uv":
      return "for your retina-burning pleasure";
    case "pumpkin":
      return "Windows logo jack-o-lantern?";
    case "mint":
      return "Life is mint to be refreshing!";
    case "dracula":
      return "Your Phone, Now Undeadly Cool";
    case "tangerine":
      return "Like oranges, but better!";
    case "sunset":
      return "Golden hour every hour";
    case "outrun":
      return "Digital nostalgia for the modern era.";
  }
}
