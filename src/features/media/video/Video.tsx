import * as portals from "react-reverse-portal";
import { useVideoPortalNode } from "./VideoPortalProvider";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";
import Player, { PlayerProps } from "./Player";

export interface VideoProps extends PlayerProps {}

export default forwardRef<HTMLVideoElement, VideoProps>(function Video(
  { src, ...props },
  ref,
) {
  const router = useOptimizedIonRouter();
  const location = useMemo(
    () => router.getRouteInfo()?.pathname ?? "",
    [router],
  );
  const portalNode = useVideoPortalNode(src, location);

  useImperativeHandle(
    ref,
    () => portalNode?.element.querySelector("* > video") as HTMLVideoElement,
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
});
