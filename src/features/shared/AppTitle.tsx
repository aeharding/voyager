import { IonTitle } from "@ionic/react";
import {
  ComponentProps,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { isIosTheme } from "#/helpers/device";

export interface AppTitleHandle {
  updateLayout: () => void;
}

interface AppTitleProps extends ComponentProps<typeof IonTitle> {
  /**
   * Padding applied to titles of normal headers with up to
   * two icon buttons on right side of title
   */
  fullPadding?: number;

  appRef?: React.RefObject<AppTitleHandle | undefined>;
}

export default isIosTheme() ? IosAppTitle : IonTitle;

function IosAppTitle({ fullPadding, appRef, ...props }: AppTitleProps) {
  const titleRef = useRef<HTMLIonTitleElement>(null);
  const [smaller, setSmaller] = useState(false);

  const updateLayout = useCallback(() => {
    const buttons = titleRef.current
      ?.closest("ion-header")
      ?.querySelector('ion-buttons[slot="end"]')?.children.length;

    if (!buttons) {
      setSmaller(false);
      return;
    }

    setSmaller(buttons >= 3);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      updateLayout();
    });
  });

  useImperativeHandle(
    appRef,
    () => ({
      updateLayout,
    }),
    [updateLayout],
  );

  return (
    <IonTitle
      {...props}
      ref={titleRef}
      style={{ paddingInline: smaller ? "110px" : `${fullPadding ?? 90}px` }}
    />
  );
}
