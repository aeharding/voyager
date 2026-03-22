import { IonNavCustomEvent } from "@ionic/core";
import { IonNav } from "@ionic/react";
import { use, useRef, useState } from "react";

import { DynamicDismissableModalContext } from "#/features/shared/DynamicDismissableModal";
import {
  getInstanceFromRemoteHandle,
  getUsernameFromRemoteHandle,
} from "#/helpers/lemmy";
import useIonNavBackButtonListener from "#/helpers/useIonNavBackButtonListener";

import Login from "./login/Login";
import Welcome from "./welcome/Welcome";

function blurDocument() {
  (document.activeElement as HTMLElement)?.blur();
}

interface LoginNavProps {
  /**
   * The remote account handle for reauthentication.
   * Bypass server selection and prefill readonly username field
   */
  initialAccountHandle?: string;
}

export default function LoginNav({ initialAccountHandle }: LoginNavProps) {
  const [root] = useState(
    () =>
      function render() {
        if (initialAccountHandle) {
          return (
            <Login
              url={getInstanceFromRemoteHandle(initialAccountHandle)}
              siteIcon={undefined}
              username={getUsernameFromRemoteHandle(initialAccountHandle)}
            />
          );
        }
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
