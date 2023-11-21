import React, { useCallback, useContext, useEffect, useState } from "react";
import { useIonActionSheet } from "@ionic/react";
import { PageContext } from "../auth/PageContext";
import { Prompt, useLocation } from "react-router";
import IonModalAutosizedForOnScreenKeyboard from "./IonModalAutosizedForOnScreenKeyboard";
import { useAppSelector } from "../../store";
import { jwtIssSelector } from "../auth/authSlice";
import { clearRecoveredText } from "../../helpers/useTextRecovery";
import useStateRef from "../../helpers/useStateRef";

export interface DismissableProps {
  dismiss: () => void;
  setCanDismiss: (canDismiss: boolean) => void;
}

interface DynamicDismissableModalProps {
  setIsOpen: (open: boolean) => void;
  isOpen: boolean;

  children: (props: DismissableProps) => React.ReactElement;
}

export function DynamicDismissableModal({
  setIsOpen,
  isOpen,
  children: renderModalContents,
}: DynamicDismissableModalProps) {
  const pageContext = useContext(PageContext);
  const location = useLocation();
  const iss = useAppSelector(jwtIssSelector);

  const [canDismissRef, setCanDismiss] = useStateRef(true);

  const [presentActionSheet] = useIonActionSheet();

  const [presentingElement, setPresentingElement] = useState<
    HTMLElement | undefined
  >();

  useEffect(() => {
    setPresentingElement(pageContext.pageRef?.current ?? undefined);

    // In <TabbedRoutes>, <IonRouterOutlet> rebuilds (see `key`) when iss changes,
    // so grab new IonRouterOutlet
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageContext.pageRef, iss]);

  const onDismissAttemptCb = useCallback(async () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();

    await presentActionSheet([
      {
        text: "Delete",
        role: "destructive",
        handler: () => {
          clearRecoveredText();
          setCanDismiss(true);
          setTimeout(() => setIsOpen(false), 100);
        },
      },
      {
        text: "Cancel",
        role: "cancel",
      },
    ]);

    return false;
  }, [presentActionSheet, setCanDismiss, setIsOpen]);

  // Close tab
  useUnload((e) => {
    if (canDismissRef.current) return;

    e.preventDefault();

    confirm("Are you sure you want to discard your work?");
  });

  // HTML5 route change, and Prompt already caught and user acknowledged
  useEffect(() => {
    if (!isOpen) return;

    setCanDismiss(true);
    setTimeout(() => setIsOpen(false), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <Prompt
        when={!canDismissRef.current}
        message="Are you sure you want to discard your work?"
      />
      <IonModalAutosizedForOnScreenKeyboard
        isOpen={isOpen}
        canDismiss={
          canDismissRef.current ? canDismissRef.current : onDismissAttemptCb
        }
        onDidDismiss={() => setIsOpen(false)}
        presentingElement={presentingElement}
        onWillDismiss={() => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }}
      >
        {renderModalContents({
          setCanDismiss,
          dismiss: () => {
            if (canDismissRef.current) {
              setIsOpen(false);
              return;
            }

            onDismissAttemptCb();
          },
        })}
      </IonModalAutosizedForOnScreenKeyboard>
    </>
  );
}

const useUnload = (fn: (e: BeforeUnloadEvent) => void) => {
  const cb = React.useRef(fn);

  React.useEffect(() => {
    const onUnload = cb.current;
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [cb]);
};
