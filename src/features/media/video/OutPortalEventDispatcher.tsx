import styled from "@emotion/styled";
import React, { MouseEvent, useEffect, useRef } from "react";

const Container = styled.div`
  flex: 1;
  display: flex;
  width: 100%;
`;

export interface OutPortalEventDispatcherProps {
  children: React.ReactNode;
  onClick?: (e: MouseEvent) => boolean | void;
  eventsToPropagateViaOutPortal?: (keyof HTMLElementEventMap)[];
}

/**
 * `react-reverse-portal` currently does not bubble events from OutPortal
 * (https://github.com/httptoolkit/react-reverse-portal/pull/34)
 *
 * So this component hacks that for us by re-dispatching events on parentElement
 */
export default function OutPortalEventDispatcher({
  children,
  onClick,
  eventsToPropagateViaOutPortal = [],
}: OutPortalEventDispatcherProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const parentToDispatch = container.parentElement;
    if (!parentToDispatch) return;

    const handleEvent = (event: Event) => {
      // I'm not really sure why this is necessary, but for some reason in Safari
      // onClick on <video /> is called *after* this handleEvent function
      // so propagation cannot be stopped.
      // Probably some weird portal+reactevents+browser issue.
      // So, hack = manually call onClick *now* and don't do anything if
      // onClick function returns true
      if (event.type === "click" && onClick?.(event as unknown as MouseEvent))
        return;

      const EventConstructor = event.constructor as typeof Event;

      // Dispatch event on parent of current <OutPortal />
      parentToDispatch.dispatchEvent(new EventConstructor(event.type, event));

      // Prevent propagation on original event.
      // Newly dispatched event above will propagate from OutPortal
      event.stopPropagation();
    };

    for (const eventName of eventsToPropagateViaOutPortal) {
      container.addEventListener(eventName, handleEvent);
    }

    return () => {
      for (const eventName of eventsToPropagateViaOutPortal) {
        container.removeEventListener(eventName, handleEvent);
      }
    };
  }, [eventsToPropagateViaOutPortal, onClick]);

  return <Container ref={containerRef}>{children}</Container>;
}
