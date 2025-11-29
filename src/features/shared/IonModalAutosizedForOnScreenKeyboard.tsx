import { IonModal } from "@ionic/react";
import { useDocumentVisibility } from "@mantine/hooks";
import React, { useCallback, useEffect, useRef } from "react";

import { cx, sv } from "#/helpers/css";
import { isNative } from "#/helpers/device";

import styles from "./IonModalAutosizedForOnScreenKeyboard.module.css";

// TODO it's a bit buggy trying to compute this
// in realtime with the new post dialog + comment dialogs
// So hardcode for now
const FIXED_HEADER_HEIGHT = 56;

interface PWAIonModalProps extends Omit<
  React.ComponentProps<typeof IonModal>,
  "style"
> {}

function PWAIonModal(props: PWAIonModalProps) {
  const documentState = useDocumentVisibility();

  const modalRef = useRef<HTMLIonModalElement>(null);

  function updateStyles(viewportHeight: number) {
    const styles = sv({ viewportHeight });

    for (const key in styles) {
      modalRef.current?.style.setProperty(key, styles[key] as string);
    }
  }

  const updateViewport = useCallback(() => {
    if (!props.isOpen) return;
    if (documentState === "hidden") return;

    // For the rare legacy browsers that don't support it
    if (!window.visualViewport) {
      return updateStyles(document.documentElement.clientHeight);
    }

    const page = modalRef.current?.querySelector(
      ".ion-page:not(.ion-page-hidden)",
    );

    updateStyles(
      window.visualViewport.height -
        (page instanceof HTMLElement ? cumulativeOffset(page).top : 0) -
        FIXED_HEADER_HEIGHT,
    );
  }, [props.isOpen, documentState]);

  // Turning iPhone on/off can mess up the scrolling to top again
  useEffect(() => {
    updateViewport();
  }, [updateViewport]);

  const onScroll = useCallback(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }, []);

  useEffect(() => {
    if (!props.isOpen) return;

    document.addEventListener("scroll", onScroll);

    return () => {
      document.removeEventListener("scroll", onScroll);
    };
  }, [onScroll, props.isOpen]);

  useEffect(() => {
    if (!props.isOpen) return;

    const onResize = () => {
      updateViewport();
    };

    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [updateViewport, props.isOpen]);

  return (
    <IonModal
      {...props}
      ref={modalRef}
      className={cx(props.className, styles.pwaIonModal)}
      onDidPresent={() => {
        window.scrollTo(0, 0);
      }}
    />
  );
}

const Modal = isNative() ? IonModal : PWAIonModal;

/**
 * This component is only needed for Safari PWAs. It is not necessary for native.
 */
export default function IonModalAutosizedForOnScreenKeyboard(
  props: Omit<React.ComponentProps<typeof IonModal>, "style">,
) {
  return <Modal {...props} />;
}

function cumulativeOffset(element: HTMLElement) {
  let top = 0,
    left = 0;
  do {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent as HTMLElement;
  } while (element instanceof HTMLElement);

  return {
    top,
    left,
  };
}
