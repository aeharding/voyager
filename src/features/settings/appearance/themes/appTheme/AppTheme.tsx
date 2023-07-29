import { IonLabel, IonList, IonRadio, IonRadioGroup } from "@ionic/react";
import { InsetIonItem, ListHeader } from "../../../shared/formatting";
import AppThemePreview from "./AppThemePreview";
import { AppThemeType, OAppThemeType } from "../../../../../services/db";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { setTheme } from "../../../settingsSlice";

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
              <IonLabel>{getThemeName(theme)}</IonLabel>
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
