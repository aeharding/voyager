import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useIonActionSheet } from "@ionic/react";
import { PageContext } from "../auth/PageContext";
import { Prompt, useLocation } from "react-router";
import IonModalAutosizedForOnScreenKeyboard from "./IonModalAutosizedForOnScreenKeyboard";
import { useAppSelector } from "../../store";
import { jwtIssSelector } from "../auth/authSelectors";
import { clearRecoveredText } from "../../helpers/useTextRecovery";
import useStateRef from "../../helpers/useStateRef";

export interface DismissableProps {
  dismiss: () => void;
  setCanDismiss: (canDismiss: boolean) => void;
}

interface DynamicDismissableModalProps {
  setIsOpen: (open: boolean) => void;
  isOpen: boolean;

  children:
    | React.ReactElement
    | ((props: DismissableProps) => React.ReactElement);

  className?: string;
  dismissClassName?: string;
}

export function DynamicDismissableModal({
  setIsOpen,
  isOpen,
  children: renderModalContents,
  className,
  dismissClassName,
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

    await presentActionSheet({
      cssClass: dismissClassName,
      buttons: [
        {
          text: "Discard",
          role: "destructive",
          handler: () => {
            clearRecoveredText();
            setCanDismiss(true);
            setIsOpen(false);
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });

    return false;
  }, [presentActionSheet, setCanDismiss, setIsOpen, dismissClassName]);

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
    setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const dismiss = useCallback(() => {
    if (canDismissRef.current) {
      setIsOpen(false);
      return;
    }

    onDismissAttemptCb();
  }, [canDismissRef, onDismissAttemptCb, setIsOpen]);

  const context = useMemo(
    () => ({ dismiss, setCanDismiss }),
    [dismiss, setCanDismiss],
  );

  const content = useMemo(
    () =>
      typeof renderModalContents === "function"
        ? renderModalContents({
            setCanDismiss,
            dismiss,
          })
        : renderModalContents,
    [dismiss, renderModalContents, setCanDismiss],
  );

  return (
    <>
      {isOpen && (
        <Prompt
          // https://github.com/remix-run/react-router/issues/5405#issuecomment-673811334
          when={true}
          message={() => {
            if (canDismissRef.current) return true;

            return "Are you sure you want to discard your work?";
          }}
        />
      )}
      <IonModalAutosizedForOnScreenKeyboard
        className={className}
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
        <DynamicDismissableModalContext.Provider value={context}>
          {content}
        </DynamicDismissableModalContext.Provider>
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

export const DynamicDismissableModalContext = createContext<{
  dismiss: () => void;
  setCanDismiss: (canDismiss: boolean) => void;
}>({ dismiss: () => {}, setCanDismiss: () => {} });
