import { IonNavCustomEvent } from "@ionic/core";
import { IonNav } from "@ionic/react";
import { use, useRef, useState } from "react";

import { DynamicDismissableModalContext } from "#/features/shared/DynamicDismissableModal";
import useIonNavBackButtonListener from "#/helpers/useIonNavBackButtonListener";

import Welcome from "./welcome/Welcome";

function blurDocument() {
  (document.activeElement as HTMLElement)?.blur();
}

export default function LoginNav() {
  const [root] = useState(
    () =>
      function render() {
        return <Welcome />;
      },
  );

  const { setCanDismiss } = use(DynamicDismissableModalContext);

  async function onIonNavDidChange(event: IonNavCustomEvent<void>) {
    if ((await event.target.getLength()) === 1) {
      setCanDismiss(true);
    }
  }

  const navRef = useRef<HTMLIonNavElement>(null);

  useIonNavBackButtonListener(navRef);

  return (
    <IonNav
      root={root}
      onIonNavWillChange={blurDocument}
      onIonNavDidChange={onIonNavDidChange}
      ref={navRef}
    />
  );
}
