import * as portals from "react-reverse-portal";
import { useVideoPortalNode } from "./VideoPortalProvider";
import { forwardRef, useImperativeHandle } from "react";
import type { PlayerProps } from "./Player";
import type Player from "./Player";

export interface VideoProps extends PlayerProps {}

const Video = forwardRef<HTMLVideoElement | undefined, VideoProps>(
  function Video({ src, ...props }, ref) {
    const portalNode = useVideoPortalNode(src);

    useImperativeHandle(
      ref,
      () => portalNode?.element.querySelector("video") ?? undefined,
      [portalNode],
    );

    return (
      <div style={props.style} className={props.className}>
        {portalNode ? (
          <portals.OutPortal<typeof Player>
            node={portalNode}
            {...props}
            src={src}
          />
        ) : undefined}
      </div>
    );
  },
);

export default Video;
