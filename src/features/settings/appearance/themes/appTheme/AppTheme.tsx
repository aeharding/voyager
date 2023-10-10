import {
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  useIonAlert,
} from "@ionic/react";
import { InsetIonItem, ListHeader } from "../../../shared/formatting";
import AppThemePreview from "./AppThemePreview";
import { AppThemeType, OAppThemeType } from "../../../../../services/db";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { setTheme } from "../../../settingsSlice";
import styled from "@emotion/styled";
import { getTheme } from "../../../../../theme/AppThemes";
import { capitalize } from "lodash";
import { useTheme } from "@emotion/react";

const Description = styled.div`
  font-size: 0.76em;
  color: var(--ion-color-medium);
`;

export default function AppTheme() {
  const theme = useAppSelector((state) => state.settings.appearance.theme);
  const dispatch = useAppDispatch();
  const [presentAlert] = useIonAlert();
  const userTheme = useTheme();

  function onChangeTheme(themeName: AppThemeType) {
    dispatch(setTheme(themeName));

    const theme = getTheme(themeName);

    if (theme.dark.background && !theme.light.background && !userTheme.dark) {
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
            <InsetIonItem key={theme}>
              <AppThemePreview appTheme={theme} />
              <IonLabel>
                <div>{getThemeName(theme)}</div>
                <Description>{getThemeDescription(theme)}</Description>
              </IonLabel>
              <IonRadio value={theme} />
            </InsetIonItem>
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
  }
}
