import { IonIcon } from "@ionic/react";
import { IonButton } from "@ionic/react";
import { IonBackButton } from "@ionic/react";
import { close } from "ionicons/icons";
import { use } from "react";

import { OutletContext } from "../Outlet";
import { useIsSecondColumn } from "./useIsSecondColumn";

export function PostBackButton(
  props: Omit<React.ComponentProps<typeof IonBackButton>, "ref">,
) {
  const isSecondColumn = useIsSecondColumn();
  const { setPostDetail } = use(OutletContext);

  if (isSecondColumn)
    return (
      <IonButton onClick={() => setPostDetail(undefined)}>
        <IonIcon icon={close} /> Close
      </IonButton>
    );

  return <IonBackButton {...props} />;
}
