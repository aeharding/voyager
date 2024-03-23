import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../shared/formatting";
import { IconBg } from "../../../routes/pages/settings/SettingsPage";
import { colorPalette } from "ionicons/icons";
import { SettingLabel } from "../../user/Profile";

export default function ThemesButton() {
  return (
    <>
      <ListHeader>
        <IonLabel>Themes</IonLabel>
      </ListHeader>
      <IonList inset>
        <IonItem routerLink="/settings/appearance/theme">
          <IconBg color="color(display-p3 0.5 0 1)">
            <IonIcon icon={colorPalette} />
          </IconBg>
          <SettingLabel>Themes</SettingLabel>
        </IonItem>
      </IonList>
    </>
  );
}
