import { useIonViewWillEnter } from "@ionic/react";
import { last, noop, without } from "es-toolkit";
import {
  createContext,
  use,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useId,
  useRef,
  useState,
} from "react";
import * as portals from "react-reverse-portal";

import type Player from "./Player";
import PortaledPlayer from "./PortaledPlayer";

export default function VideoPortalProvider({
  children,
}: React.PropsWithChildren) {
  const [videoRefs, _setVideoRefs] = useState<VideoRefs>({});
  const videoRefsRef = useRef(videoRefs); // yodawg

  function setVideoRefs(videoRefs: VideoRefs) {
    videoRefsRef.current = videoRefs;
    _setVideoRefs(videoRefs);
  }

  useEffect(() => {
    videoRefsRef.current = videoRefs;
  }, [videoRefs]);

  const getPortalNodeForMediaId: GetPortalNodeForMediaId = (
    mediaId,
    outPortalUid,
  ) => {
    const videoRefs = videoRefsRef.current;

    const potentialExisting = videoRefs[mediaId];
    if (potentialExisting) {
      setVideoRefs({
        ...videoRefs,
        [mediaId]: {
          ...potentialExisting,
          // most recently used (currently playing location) is last
          outPortalUids: [
            ...without(potentialExisting.outPortalUids, outPortalUid),
            outPortalUid,
          ],
        },
      });

      return potentialExisting.portalNode;
    }

    const newRef = {
      outPortalUids: [outPortalUid],
      portalNode: portals.createHtmlPortalNode({
        attributes: { style: "flex:1;display:flex;width:100%" },
      }),
    };

    setVideoRefs({
      ...videoRefs,
      [mediaId]: newRef,
    });

    return newRef.portalNode;
  };

  function cleanupPortalNodeForMediaIdIfNeeded(
    mediaId: string,
    sourceUid: string,
  ) {
    const videoRefs = videoRefsRef.current;

    const videoRef = videoRefs[mediaId];

    if (!videoRef) return;

    if (
      videoRef.outPortalUids.length === 1 &&
      videoRef.outPortalUids[0] === sourceUid
    ) {
      const updatedVideoRefs = { ...videoRefs };
      delete updatedVideoRefs[mediaId];

      setVideoRefs(updatedVideoRefs);
    } else {
      setVideoRefs({
        ...videoRefs,
        [mediaId]: {
          ...videoRef,
          outPortalUids: without(videoRef.outPortalUids, sourceUid),
        },
      });
    }
  }

  return (
    <VideoPortalContext
      value={{
        videoRefs,
        getPortalNodeForMediaId,
        cleanupPortalNodeForMediaIdIfNeeded,
      }}
    >
      {children}
      {Object.entries(videoRefs).map(([mediaId, { portalNode }]) => (
        <portals.InPortal node={portalNode} key={mediaId}>
          <PortaledPlayer /> {/* InPortal will pass props from OutPortal */}
        </portals.InPortal>
      ))}
    </VideoPortalContext>
  );
}

type VideoRefs = Record<
  string,
  {
    outPortalUids: string[];
    portalNode: PortalNode;
  }
>;

type PortalNode = portals.HtmlPortalNode<typeof Player>;

interface VideoPortalContextState {
  videoRefs: VideoRefs;
  getPortalNodeForMediaId: GetPortalNodeForMediaId;
  cleanupPortalNodeForMediaIdIfNeeded: (
    mediaId: string,
    sourceUid: string,
  ) => void;
}

type GetPortalNodeForMediaId = (
  mediaId: string,
  outPortalUid: string,
) => PortalNode | void;

const VideoPortalContext = createContext<VideoPortalContextState>({
  videoRefs: {},
  getPortalNodeForMediaId: noop,
  cleanupPortalNodeForMediaIdIfNeeded: noop,
});

export function useVideoPortalNode(
  mediaId: string | undefined,
): PortalNode | void {
  const previousMediaIdRef = useRef<string | undefined>(mediaId);
  const outPortalUid = useId();

  const {
    getPortalNodeForMediaId,
    cleanupPortalNodeForMediaIdIfNeeded,
    videoRefs,
  } = use(VideoPortalContext);

  // Sometimes useIonViewWillEnter fires after element is already destroyed
  const destroyed = useRef(false);

  const getPortalNodeEvent = useEffectEvent(() => {
    if (destroyed.current) return;
    if (!mediaId) return;

    getPortalNodeForMediaId(mediaId, outPortalUid);
  });

  const cleanupPortalNodeIfNeededEvent = useEffectEvent(() => {
    destroyed.current = true;
    if (!previousMediaIdRef.current) return;
    cleanupPortalNodeForMediaIdIfNeeded(
      previousMediaIdRef.current,
      outPortalUid,
    );
  });

  useEffect(() => {
    previousMediaIdRef.current = mediaId;
    destroyed.current = false;
    getPortalNodeEvent();

    return cleanupPortalNodeIfNeededEvent;
  }, [mediaId]);

  useIonViewWillEnter(() => {
    getPortalNodeEvent();
  });

  if (!mediaId) return;

  const potentialVideoRef = videoRefs[mediaId];

  if (
    potentialVideoRef?.outPortalUids &&
    last(potentialVideoRef?.outPortalUids) === outPortalUid
  )
    return potentialVideoRef.portalNode;
}
