import { IonNavCustomEvent } from "@ionic/core";
import { IonNav } from "@ionic/react";
import { useContext, useState } from "react";

import { DynamicDismissableModalContext } from "#/features/shared/DynamicDismissableModal";

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

  const { setCanDismiss } = useContext(DynamicDismissableModalContext);

  async function onIonNavDidChange(event: IonNavCustomEvent<void>) {
    if ((await event.target.getLength()) === 1) {
      setCanDismiss(true);
    }
  }

  return (
    <IonNav
      root={root}
      onIonNavWillChange={blurDocument}
      onIonNavDidChange={onIonNavDidChange}
    />
  );
}
