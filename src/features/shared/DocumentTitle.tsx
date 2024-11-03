import { useIonViewDidEnter, useIonViewDidLeave } from "@ionic/react";
import { useState } from "react";

import { isInstalled } from "#/helpers/device";

interface TitleProps {
  children: string;
}

function WebDocumentTitle({ children }: TitleProps) {
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

/**
 * no-op for installed (title not relevant/supported)
 */
function NativeDocumentTitle() {
  return null;
}

export default isInstalled() ? NativeDocumentTitle : WebDocumentTitle;
