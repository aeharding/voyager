import { MouseEvent } from "react";
import OutPortalEventDispatcher, {
  OutPortalEventDispatcherProps,
} from "./OutPortalEventDispatcher";
import Player, { PlayerProps } from "./Player";

/**
 * These events must bubble via OutPortal
 * for `<IonSliding />` to properly function
 */
const eventsToPropagateViaOutPortal: OutPortalEventDispatcherProps["eventsToPropagateViaOutPortal"] =
  [
    "click",

    // pointer
    "mousedown",
    "mousemove",
    "mouseup",
    "drag",

    // touch
    "touchstart",
    "touchmove",
    "touchend",
    "touchcancel",
  ];

interface PortaledPlayerProps extends PlayerProps {
  onClick?: (e: MouseEvent) => boolean | void;
}

/**
 * Need to wrap with EventCatcher to propagate events,
 * but also need props to be set on <Player />
 */
export default function PortaledPlayer({
  onClick,
  ...props
}: PortaledPlayerProps) {
  return (
    <OutPortalEventDispatcher
      eventsToPropagateViaOutPortal={eventsToPropagateViaOutPortal}
      // hack: pull the onClick off the props and let OutPortalEventDispatcher handle directly
      onClick={onClick}
    >
      <Player {...props} />
    </OutPortalEventDispatcher>
  );
}
