import { IonIcon } from "@ionic/react";
import { IonButton } from "@ionic/react";
import { IonBackButton } from "@ionic/react";
import { close } from "ionicons/icons";
import { use } from "react";

import { OutletContext } from "../OutletProvider";
import { useIsSecondColumn } from "./useIsSecondColumn";

export function AppBackButton(
  props: Omit<React.ComponentProps<typeof IonBackButton>, "ref">,
) {
  const isSecondColumn = useIsSecondColumn();
  const { setSecondColumnLocation: setPostDetail } = use(OutletContext);

  if (isSecondColumn)
    return (
      <IonButton onClick={() => setPostDetail(undefined)}>
        <IonIcon icon={close} /> Close
      </IonButton>
    );

  return <IonBackButton {...props} />;
}
