import { IonActionSheet, IonButton, IonIcon } from "@ionic/react";
import { peopleCircleOutline, planetOutline } from "ionicons/icons";
import { useState } from "react";

export default function PostFilter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IonButton fill="default" onClick={() => setOpen(true)}>
        <IonIcon icon={planetOutline} color="primary" />
      </IonButton>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        header="Show..."
        buttons={[
          {
            text: "Federated",
            role: "all",
            icon: planetOutline,
          },
          {
            text: "Local Only",
            role: "local",
            icon: peopleCircleOutline,
          },
        ]}
      />
    </>
  );
}
