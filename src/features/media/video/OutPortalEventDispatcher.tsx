import { styled } from "@linaria/react";
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
  eventsToPropagateViaOutPortal = [],
}: OutPortalEventDispatcherProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const parentToDispatch = container.parentElement;

    const handleEvent = async (event: Event) => {
      const EventConstructor = event.constructor as typeof Event;

      function dispatchEvent() {
        if (!parentToDispatch) return;

        // Dispatch event on parent of current <OutPortal />
        parentToDispatch.dispatchEvent(new EventConstructor(event.type, event));
      }

      // Prevent propagation on original event.
      // Newly dispatched event above will propagate from OutPortal
      if (event.type === "click") {
        requestAnimationFrame(() => {
          if (event.defaultPrevented) return;

          dispatchEvent();
        });
      } else {
        dispatchEvent();

        event.stopPropagation();
      }
    };

    for (const eventName of eventsToPropagateViaOutPortal) {
      container.addEventListener(eventName, handleEvent);
    }

    return () => {
      for (const eventName of eventsToPropagateViaOutPortal) {
        container.removeEventListener(eventName, handleEvent);
      }
    };
  }, [eventsToPropagateViaOutPortal]);

  return <Container ref={containerRef}>{children}</Container>;
}
