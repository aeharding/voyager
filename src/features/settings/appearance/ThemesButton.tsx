import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { colorPalette } from "ionicons/icons";

import { ListHeader } from "#/features/settings/shared/formatting";
import { IconBg } from "#/routes/pages/settings/SettingsPage";

export default function ThemesButton() {
  return (
    <>
      <ListHeader>
        <IonLabel>Themes</IonLabel>
      </ListHeader>
      <IonList inset>
        <IonItem routerLink="/settings/appearance/theme">
          <IconBg color="color(display-p3 0.5 0 1)" slot="start">
            <IonIcon icon={colorPalette} />
          </IconBg>
          <IonLabel>Themes</IonLabel>
        </IonItem>
      </IonList>
    </>
  );
}
