import { IonIcon } from "@ionic/react";
import React, { useMemo } from "react";

/* Workaround
This wrapper can be removed if:
- IonIcon fixes their icons for webkit/safari browsers: https://github.com/ionic-team/ionicons/issues/1176
- Safari fixes svg rendering

This wrapper can be replaced by something like `ion-icon::part(svg) { stroke: unset }` in index.css, 
if ion-icon gets a shadow part that allows css access to the svg element. Some icons rely on a stroke,
so this needs to be done on a per-icon basis.
*/

interface IonIconProps {
  color?: string;
  flipRtl?: boolean;
  icon?: string;
  ios?: string;
  lazy?: boolean;
  md?: string;
  mode?: "ios" | "md";
  name?: string;
  size?: string;
  src?: string;
}

/**
 * **Do not use if icon needs a stroke!** Fixes jagged icon appearance on iOS for filled icons.
 */
export default function IonIconNoStroke({ icon, ...props }: IonIconProps) {
  const iconWithoutStrokeStyle = useMemo(() => {
    if (icon) {
      return removeStrokeStyleFromIcon(icon);
    }
  }, [icon]);

  return <IonIcon icon={iconWithoutStrokeStyle ?? icon} {...props} />;
}

function removeStrokeStyleFromIcon(icon: string) {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = icon;
  const cleanedElement = tempElement.querySelector("svg");
  if (cleanedElement) {
    cleanedElement.style["stroke"] = "unset";
    return tempElement.innerHTML;
  }
}
