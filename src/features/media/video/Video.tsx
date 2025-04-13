import { useImperativeHandle } from "react";

import type { PlayerProps } from "./Player";
import Player from "./Player";
import { OutPortalPlayer } from "./PortaledPlayer";
import { useVideoPortalNode } from "./VideoPortalProvider";

export interface VideoProps extends Omit<PlayerProps, "ref"> {
  ref: React.RefObject<HTMLVideoElement | undefined>;

  /**
   * A unique identifier to track a specific video
   * as it is portaled around the app
   */
  portalWithMediaId?: string;
}

export default function Video({ portalWithMediaId, ...props }: VideoProps) {
  if (!portalWithMediaId) return <UnportaledVideo {...props} />;

  return <PortaledVideo {...props} portalWithMediaId={portalWithMediaId} />;
}

function UnportaledVideo(props: VideoProps) {
  return (
    <Player {...props} ref={props.ref as React.RefObject<HTMLVideoElement>} />
  );
}

// portalWithMediaId is required
type PortaledVideoProps = Omit<VideoProps, "portalWithMediaId"> &
  Required<Pick<VideoProps, "portalWithMediaId">>;

function PortaledVideo({
  ref,
  portalWithMediaId,
  ...props
}: PortaledVideoProps) {
  const portalNode = useVideoPortalNode(portalWithMediaId);

  useImperativeHandle(
    ref,
    () => portalNode?.element.querySelector("video") ?? undefined,
    [portalNode],
  );

  return (
    <span style={props.style} className={props.className}>
      {portalNode ? (
        <OutPortalPlayer {...props} node={portalNode} />
      ) : undefined}
    </span>
  );
}
