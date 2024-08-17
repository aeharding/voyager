import { IonTitle } from "@ionic/react";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { isIosTheme } from "../../helpers/device";

interface AppTitleProps extends ComponentProps<typeof IonTitle> {
  /**
   * Padding applied to titles of normal headers with up to
   * two icon buttons on right side of title
   */
  fullPadding?: number;
}

export default isIosTheme() ? IosAppTitle : IonTitle;

function IosAppTitle({ fullPadding, ...props }: AppTitleProps) {
  const ref = useRef<HTMLIonTitleElement>(null);
  const [smaller, setSmaller] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const buttons = ref.current
        ?.closest("ion-header")
        ?.querySelector('ion-buttons[slot="end"]')?.children.length;

      if (!buttons) {
        setSmaller(false);
        return;
      }

      setSmaller(buttons >= 3);
    });
  });

  return (
    <IonTitle
      {...props}
      ref={ref}
      style={{ paddingInline: smaller ? "110px" : `${fullPadding ?? 90}px` }}
    />
  );
}
