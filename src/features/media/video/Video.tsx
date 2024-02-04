import * as portals from "react-reverse-portal";
import { useVideoPortalNode } from "./VideoPortalProvider";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";

interface VideoProps {
  src: string;
}

export default forwardRef<HTMLVideoElement, VideoProps>(
  function Video(props, ref) {
    const router = useOptimizedIonRouter();
    const location = useMemo(
      () => router.getRouteInfo()?.pathname ?? "",
      [router],
    );
    const portalNode = useVideoPortalNode(props.src, location);

    useImperativeHandle(
      ref,
      () => portalNode?.element.querySelector("* > video") as HTMLVideoElement,
      [portalNode],
    );

    if (!portalNode) return null;

    return <portals.OutPortal node={portalNode} {...props} />;
  },
);
