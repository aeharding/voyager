import { IonBadge, IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { alert } from "ionicons/icons";
import { useContext } from "react";

import { PageContext } from "#/features/auth/PageContext";
import { IconBg } from "#/routes/pages/settings/SettingsPage";

export default function DatabaseErrorItem() {
  const { presentDatabaseErrorModal } = useContext(PageContext);

  return (
    <IonList inset>
      <IonItem onClick={() => presentDatabaseErrorModal()}>
        <IconBg color="color(display-p3 1 0.7 0)" size="1.2" slot="start">
          <IonIcon icon={alert} />
        </IconBg>
        <IonLabel>Error — App limited</IonLabel>
        <IonBadge color="danger">!</IonBadge>
      </IonItem>
    </IonList>
  );
}
