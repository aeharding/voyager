import { IonTitle } from "@ionic/react";
import { ComponentProps, useEffect, useRef, useState } from "react";

interface AppTitleProps extends ComponentProps<typeof IonTitle> {
  fullPadding?: number;
}

export default function AppTitle({ fullPadding, ...props }: AppTitleProps) {
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
