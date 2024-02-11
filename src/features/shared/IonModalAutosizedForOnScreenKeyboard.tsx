import { IonModal } from "@ionic/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import usePageVisibility from "../../helpers/usePageVisibility";
import { isNative } from "../../helpers/device";
import { styled } from "@linaria/react";

// TODO it's a bit buggy trying to compute this
// in realtime with the new post dialog + comment dialogs
// So hardcode for now
const FIXED_HEADER_HEIGHT = 56;

const StyledIonModal = styled(IonModal)<{ viewportHeight: number }>`
  /* Capacitor inside native web view resizes for on-screen keyboard, so we don't need bespoke layout management */
  ion-content::part(scroll) {
    max-height: ${({ viewportHeight }) => viewportHeight}px;
  }

  ion-content .fixed-toolbar-container {
    max-height: ${({ viewportHeight }) => viewportHeight}px;
  }
`;

const Modal = isNative() ? IonModal : StyledIonModal;

/**
 * This component is only needed for Safari PWAs. It is not necessary for native.
 */
export default function IonModalAutosizedForOnScreenKeyboard(
  props: React.ComponentProps<typeof IonModal>,
) {
  const [viewportHeight, setViewportHeight] = useState(
    document.documentElement.clientHeight,
  );
  const isVisible = usePageVisibility();

  const modalRef = useRef<HTMLIonModalElement>(null);

  const updateViewport = useCallback(() => {
    if (!props.isOpen) return;

    // For the rare legacy browsers that don't support it
    if (!window.visualViewport) {
      return;
    }

    const page = modalRef.current?.querySelector(
      ".ion-page:not(.ion-page-hidden)",
    );

    setViewportHeight(
      window.visualViewport.height -
        (page instanceof HTMLElement ? cumulativeOffset(page).top : 0) -
        FIXED_HEADER_HEIGHT,
    );
  }, [props.isOpen]);

  const onScroll = useCallback(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }, []);

  // Turning iPhone on/off can mess up the scrolling to top again
  useEffect(() => {
    if (!props.isOpen) return;

    updateViewport();
  }, [isVisible, updateViewport, props.isOpen]);

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
    <Modal
      ref={modalRef}
      viewportHeight={viewportHeight}
      onDidPresent={() => {
        window.scrollTo(0, 0);
      }}
      {...props}
    />
  );
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
    top: top,
    left: left,
  };
}
