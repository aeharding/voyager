import * as portals from "react-reverse-portal";
import { useVideoPortalNode } from "./VideoPortalProvider";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import Player, { PlayerProps } from "./Player";
import { getVideoSrcForUrl } from "../../../helpers/url";

export interface VideoProps extends Omit<PlayerProps, "src"> {
  url: string;
}

const Video = forwardRef<HTMLVideoElement | undefined, VideoProps>(
  function Video({ url, ...props }, ref) {
    const portalNode = useVideoPortalNode(url);
    const src = useMemo(() => getVideoSrcForUrl(url), [url]);

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
