import { IonIcon } from "@ionic/react";
import { ellipsisHorizontal, ellipsisVertical } from "ionicons/icons";
import { ComponentProps } from "react";

import { isIosTheme } from "#/helpers/device";

export default function HeaderEllipsisIcon(
  props: ComponentProps<typeof IonIcon>,
) {
  return (
    <IonIcon
      {...props}
      icon={isIosTheme() ? ellipsisHorizontal : ellipsisVertical}
      className={props.className}
    />
  );
}
