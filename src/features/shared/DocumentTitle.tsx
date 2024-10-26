import { useIonViewDidEnter, useIonViewDidLeave } from "@ionic/react";
import { useState } from "react";

interface TitleProps {
  children: string;
}

export default function DocumentTitle({ children }: TitleProps) {
  const [show, setShow] = useState(true);

  useIonViewDidLeave(() => {
    setShow(false);
  });

  useIonViewDidEnter(() => {
    setShow(true);
  });

  if (!show) return null;

  return <title>{children}</title>;
}
