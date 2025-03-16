import { IonModal, useIonActionSheet } from "@ionic/react";
import { noop } from "es-toolkit";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Prompt, useLocation } from "react-router";

import { instanceSelector } from "#/features/auth/authSelectors";
import { PageContext } from "#/features/auth/PageContext";
import { isNative } from "#/helpers/device";
import useStateRef from "#/helpers/useStateRef";
import { clearRecoveredText } from "#/helpers/useTextRecovery";
import { useAppDispatch, useAppSelector } from "#/store";

import IonModalAutosizedForOnScreenKeyboard from "./IonModalAutosizedForOnScreenKeyboard";
import {
  deletePendingImageUploads,
  onHandledPendingImages,
} from "./markdown/editing/uploadImageSlice";

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
  textRecovery?: true;
}

export function DynamicDismissableModal({
  setIsOpen,
  isOpen,
  children: renderModalContents,
  className,
  dismissClassName,
  textRecovery,
}: DynamicDismissableModalProps) {
  const dispatch = useAppDispatch();
  const pageContext = useContext(PageContext);
  const location = useLocation();
  const selectedInstance = useAppSelector(
    instanceSelector ?? ((state) => state.auth.connectedInstance),
  );

  // TODO: underscore as hack to avoid compiler complaint.
  // See: https://github.com/reactwg/react-compiler/discussions/32
  const [canDismissRef_, canDismiss, setCanDismiss] = useStateRef(true);

  const [presentActionSheet] = useIonActionSheet();

  const [presentingElement, setPresentingElement] = useState<
    HTMLElement | undefined
  >();

  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  });

  useEffect(() => {
    setPresentingElement(
      pageContext.pageRef?.current?.closest("ion-tabs") ?? undefined,
    );

    // In <TabbedRoutes>, <IonRouterOutlet> rebuilds (see `key`) when iss changes,
    // so grab new IonRouterOutlet
  }, [pageContext.pageRef, selectedInstance]);

  const onDismissAttemptCb = async () => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();

    await presentActionSheet({
      cssClass: dismissClassName,
      buttons: [
        {
          text: "Discard",
          role: "destructive",
          handler: () => {
            setCanDismiss(true);
            setIsOpen(false);

            dispatch(deletePendingImageUploads());
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });

    return false;
  };

  // Close tab
  useUnload((e) => {
    if (canDismissRef_.current) return;

    e.preventDefault();

    confirm("Are you sure you want to discard your work?");
  });

  // HTML5 route change, and Prompt already caught and user acknowledged
  useEffect(() => {
    if (!isOpenRef.current) return;

    setCanDismiss(true);
    setIsOpen(false);
  }, [location.pathname, setCanDismiss, setIsOpen]);

  const dismiss = () => {
    if (canDismissRef_.current) {
      setIsOpen(false);
      return;
    }

    onDismissAttemptCb();
  };

  const content =
    typeof renderModalContents === "function"
      ? renderModalContents({
          setCanDismiss,
          dismiss,
        })
      : renderModalContents;

  const Modal = isNative() ? IonModal : IonModalAutosizedForOnScreenKeyboard;

  return (
    <>
      {isOpen && (
        <Prompt
          // https://github.com/remix-run/react-router/issues/5405#issuecomment-673811334
          when={true}
          message={() => {
            if (canDismissRef_.current) return true;

            return "Are you sure you want to discard your work?";
          }}
        />
      )}
      <Modal
        className={className}
        isOpen={isOpen}
        canDismiss={canDismiss ? canDismiss : onDismissAttemptCb}
        onDidDismiss={() => {
          setIsOpen(false);

          // in case onDidDismiss incorrectly called by Ionic, don't clear data
          if (textRecovery && canDismissRef_.current) clearRecoveredText();

          if (canDismissRef_.current) dispatch(onHandledPendingImages());
        }}
        presentingElement={presentingElement}
        onWillDismiss={() => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }}
      >
        <DynamicDismissableModalContext value={{ dismiss, setCanDismiss }}>
          {content}
        </DynamicDismissableModalContext>
      </Modal>
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
}>({ dismiss: noop, setCanDismiss: noop });
