import { useImperativeHandle } from "react";

import useImageData from "../useImageData";
import type { PlayerProps } from "./Player";
import Player from "./Player";
import { OutPortalPlayer } from "./PortaledPlayer";
import { useVideoPortalNode } from "./VideoPortalProvider";

export interface VideoProps extends Omit<PlayerProps, "ref"> {
  ref: React.RefObject<HTMLVideoElement | undefined>;

  /**
   * A unique identifier to track a specific video
   * as it is portaled around the app
   *
   * Generated from `buildMediaId`
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

  // when the video is portaled elsewhere, we need all available data
  const imageData = useImageData(props.src);
  const width = typeof imageData === "object" ? imageData.width : undefined;

  return (
    <span style={{ width, ...props.style }} className={props.className}>
      {portalNode ? (
        <OutPortalPlayer {...props} node={portalNode} />
      ) : undefined}
    </span>
  );
}
