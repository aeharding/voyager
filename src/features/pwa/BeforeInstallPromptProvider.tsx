import { noop } from "es-toolkit";
import React, { createContext, useEffect, useState } from "react";

interface BeforeInstallPromptContextType {
  event: BeforeInstallPromptEvent | null;
  clearEvent: () => void;
}

export const BeforeInstallPromptContext =
  createContext<BeforeInstallPromptContextType>({
    event: null,
    clearEvent: noop,
  });

export default function BeforeInstallPromptProvider({
  children,
}: React.PropsWithChildren) {
  const [beforeInstallPromptEvent, setBeforeInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  function handleBeforeInstallPrompt(event: BeforeInstallPromptEvent) {
    event.preventDefault();
    setBeforeInstallPromptEvent(event);
  }

  useEffect(() => {
    const handleBeforeInstallPromptEvent = (
      event: BeforeInstallPromptEvent,
    ) => {
      handleBeforeInstallPrompt(event);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPromptEvent as never,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPromptEvent as never,
      );
    };
  }, []);

  function clearEvent() {
    setBeforeInstallPromptEvent(null);
  }

  return (
    <BeforeInstallPromptContext
      value={{ event: beforeInstallPromptEvent, clearEvent }}
    >
      {children}
    </BeforeInstallPromptContext>
  );
}

/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>;

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;
}
