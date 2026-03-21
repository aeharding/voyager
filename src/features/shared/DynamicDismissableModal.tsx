import { IonModal, useIonActionSheet } from "@ionic/react";
import { noop } from "es-toolkit";
import React, { createContext, useState } from "react";
import { useLocation } from "react-router";

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

  const [oldIsOpen, setOldIsOpen] = useState(isOpen);

  if (oldIsOpen !== isOpen) {
    setOldIsOpen(isOpen);

    if (isOpen) setPresentingElement(document.querySelector("ion-tabs"));
  }

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

  if (oldPathname !== location.pathname) {
    setOldPathname(location.pathname);

    dismiss();
  }

  const content =
    typeof renderModalContents === "function"
      ? renderModalContents({
          setCanDismiss,
          dismiss,
        })
      : renderModalContents;

  const Modal = isNative() ? IonModal : IonModalAutosizedForOnScreenKeyboard;

  return (
    <Modal
      className={className}
      isOpen={isOpen}
      canDismiss={canDismiss ? canDismiss : onDismissAttemptCb}
      onDidDismiss={() => {
        setIsOpen(false);

        // in case onDidDismiss incorrectly called by Ionic, don't proceed
        if (!canDismissRef_.current) return;

        if (textRecovery) clearRecoveredText();

        dispatch(onHandledPendingImages());
      }}
      onIonDragEnd={(e) => {
        if (e.detail.snapBreakpoint !== 0) return;
        if (!(document.activeElement instanceof HTMLElement)) return;

        document.activeElement.blur();
      }}
      presentingElement={presentingElement ?? undefined}
      onWillDismiss={() => {
        if (!(document.activeElement instanceof HTMLElement)) return;

        document.activeElement.blur();
      }}
    >
      <DynamicDismissableModalContext value={{ dismiss, setCanDismiss }}>
        {content}
      </DynamicDismissableModalContext>
    </Modal>
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
