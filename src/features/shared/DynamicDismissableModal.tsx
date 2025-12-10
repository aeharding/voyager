import { IonModal, useIonActionSheet } from "@ionic/react";
import { noop } from "es-toolkit";
import React, { createContext, useEffect, useRef, useState } from "react";
import { Prompt, useLocation } from "react-router";

import { isNative } from "#/helpers/device";
import useStateRef from "#/helpers/useStateRef";
import { clearRecoveredText } from "#/helpers/useTextRecovery";
import { useAppDispatch } from "#/store";

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
  const location = useLocation();

  // TODO: underscore as hack to avoid compiler complaint.
  // See: https://github.com/reactwg/react-compiler/discussions/32
  const [canDismissRef_, canDismiss, setCanDismiss] = useStateRef(true);

  const [presentActionSheet] = useIonActionSheet();

  const [presentingElement, setPresentingElement] = useState<
    HTMLElement | undefined | null
  >();

  // If transitioning to open and presentingElement is not set, initialize
  if (isOpen && presentingElement === undefined) {
    setPresentingElement(document.querySelector("ion-tabs"));
  }

  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  });

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
            _dismiss();

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

  const [oldPathname, setOldPathname] = useState(location.pathname);

  const _dismiss = () => {
    // changing location (e.g. back button) w/ confirm discard changes prompt
    // causes bad Ionic state. Wait for Ionic state to settle before dismiss
    queueMicrotask(() => {
      setCanDismiss(true);
      setIsOpen(false);
    });
  };

  if (oldPathname !== location.pathname) {
    setOldPathname(location.pathname);
    _dismiss();
  }

  // Close tab
  useUnload((e) => {
    if (canDismissRef_.current) return;

    e.preventDefault();
  });

  const dismiss = () => {
    if (canDismissRef_.current) {
      _dismiss();
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

          // Attempt to fix https://github.com/aeharding/voyager/issues/2183
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setPresentingElement(undefined);
            });
          });
          // in case onDidDismiss incorrectly called by Ionic, don't clear data
          if (textRecovery && canDismissRef_.current) clearRecoveredText();

          if (canDismissRef_.current) dispatch(onHandledPendingImages());
        }}
        presentingElement={presentingElement ?? undefined}
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
