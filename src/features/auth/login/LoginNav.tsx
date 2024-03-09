import { IonNav, IonSpinner } from "@ionic/react";
import Welcome from "./welcome/Welcome";
import { styled } from "@linaria/react";
import { useCallback, useContext } from "react";
import { IonNavCustomEvent } from "@ionic/core";
import { DynamicDismissableModalContext } from "../../shared/DynamicDismissableModal";

export const Spinner = styled(IonSpinner)`
  width: 1.5rem;
`;

export const Centered = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .ios & {
    justify-content: center;
  }
`;

function blurDocument() {
  (document.activeElement as HTMLElement)?.blur();
}

export default function LoginNav() {
  const { setCanDismiss } = useContext(DynamicDismissableModalContext);

  const onIonNavDidChange = useCallback(
    (event: IonNavCustomEvent<void>) => {
      // If swiped back to root, allow swipe to dismiss
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((event.target as any).getLength() === 1) {
        setCanDismiss(true);
      }
    },
    [setCanDismiss],
  );

  return (
    <IonNav
      root={() => <Welcome />}
      onIonNavWillChange={blurDocument}
      onIonNavDidChange={onIonNavDidChange}
    />
  );
}
