import { useImperativeHandle } from "react";
import * as portals from "react-reverse-portal";

import type { PlayerProps } from "./Player";
import type Player from "./Player";
import { useVideoPortalNode } from "./VideoPortalProvider";

export interface VideoProps extends Omit<PlayerProps, "ref"> {
  ref: React.RefObject<HTMLVideoElement | undefined>;
}

export default function Video({ src, ref, ...props }: VideoProps) {
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
}
