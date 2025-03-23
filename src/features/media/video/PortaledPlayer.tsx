import * as portals from "react-reverse-portal";

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

// OutPortalPlayer will pass the player props
interface PortaledPlayerProps {}

/**
 * Need to wrap with EventCatcher to propagate events,
 * but also need props to be set on <Player />
 */
export default function PortaledPlayer(props: PortaledPlayerProps) {
  // If OutPortal isn't mounted to dom, PortaledPlayer won't receive props
  // bail to prevent error
  if (!("src" in props)) return null;

  return (
    <OutPortalEventDispatcher
      eventsToPropagateViaOutPortal={eventsToPropagateViaOutPortal}
    >
      <Player {...(props as PlayerProps)} />
    </OutPortalEventDispatcher>
  );
}

export const OutPortalPlayer = portals.OutPortal<typeof Player>;
