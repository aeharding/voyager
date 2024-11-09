import { IonNavCustomEvent } from "@ionic/core";
import { IonNav, IonSpinner } from "@ionic/react";
import { styled } from "@linaria/react";
import { useCallback, useContext, useState } from "react";

import { DynamicDismissableModalContext } from "#/features/shared/DynamicDismissableModal";

import Welcome from "./welcome/Welcome";

export const Spinner = styled(IonSpinner)`
  width: 1.5rem;
`;

export const Centered = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1;

  .ios & {
    justify-content: center;
  }

  ion-spinner {
    flex-shrink: 0;
  }
`;

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

  const onIonNavDidChange = useCallback(
    async (event: IonNavCustomEvent<void>) => {
      if ((await event.target.getLength()) === 1) {
        setCanDismiss(true);
      }
    },
    [setCanDismiss],
  );

  return (
    <IonNav
      root={root}
      onIonNavWillChange={blurDocument}
      onIonNavDidChange={onIonNavDidChange}
    />
  );
}
