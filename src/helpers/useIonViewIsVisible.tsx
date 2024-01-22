import { useIonViewDidLeave, useIonViewWillEnter } from "@ionic/react";
import { useState } from "react";

export default function useIonViewIsVisible() {
  const [visible, setVisible] = useState(false);

  useIonViewWillEnter(() => {
    setVisible(true);
  });

  useIonViewDidLeave(() => {
    setVisible(false);
  });

  return visible;
}
