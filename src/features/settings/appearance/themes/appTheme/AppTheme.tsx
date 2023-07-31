import { IonLabel, IonList, IonRadio, IonRadioGroup } from "@ionic/react";
import { InsetIonItem, ListHeader } from "../../../shared/formatting";
import AppThemePreview from "./AppThemePreview";
import { AppThemeType, OAppThemeType } from "../../../../../services/db";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { setTheme } from "../../../settingsSlice";
import styled from "@emotion/styled";

const Description = styled.div`
  font-size: 0.76em;
  color: var(--ion-color-medium);
`;

export default function AppTheme() {
  const theme = useAppSelector((state) => state.settings.appearance.theme);
  const dispatch = useAppDispatch();

  return (
    <>
      <ListHeader>
        <IonLabel>App Theme</IonLabel>
      </ListHeader>
      <IonRadioGroup
        value={theme}
        onIonChange={(e) => dispatch(setTheme(e.detail.value))}
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
  }
}
