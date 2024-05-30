import * as portals from "react-reverse-portal";
import { useVideoPortalNode } from "./VideoPortalProvider";
import { useImperativeHandle } from "react";
import Player, { PlayerProps } from "./Player";

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
