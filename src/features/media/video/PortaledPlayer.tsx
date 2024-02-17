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

/**
 * Need to wrap with EventCatcher to propagate events,
 * but also need props to be set on <Player />
 */
export default function PortaledPlayer(props: PlayerProps) {
  return (
    <OutPortalEventDispatcher
      eventsToPropagateViaOutPortal={eventsToPropagateViaOutPortal}
    >
      <Player {...props} />
    </OutPortalEventDispatcher>
  );
}
