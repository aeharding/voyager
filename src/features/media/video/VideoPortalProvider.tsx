import { useIonViewWillEnter } from "@ionic/react";
import { last, noop, without } from "es-toolkit";
import {
  createContext,
  useContext,
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
  const [videoRefs, setVideoRefs] = useState<VideoRefs>({});
  const videoRefsRef = useRef(videoRefs); // yodawg

  useEffect(() => {
    videoRefsRef.current = videoRefs;
  }, [videoRefs]);

  const getPortalNodeForSrc: GetPortalNodeForSrc = (src, sourceUid) => {
    const videoRefs = videoRefsRef.current;

    const potentialExisting = videoRefs[src];
    if (potentialExisting) {
      setVideoRefs((videoRefs) => ({
        ...videoRefs,
        [src]: {
          ...potentialExisting,
          // most recently used (currently playing location) is last
          sourceUids: [
            ...without(potentialExisting.sourceUids, sourceUid),
            sourceUid,
          ],
        },
      }));

      return potentialExisting.portalNode;
    }

    const newRef = {
      sourceUids: [sourceUid],
      portalNode: portals.createHtmlPortalNode({
        attributes: { style: "flex:1;display:flex;width:100%" },
      }),
    };

    setVideoRefs((videoRefs) => ({
      ...videoRefs,
      [src]: newRef,
    }));

    return newRef.portalNode;
  };

  function cleanupPortalNodeForSrcIfNeeded(src: string, sourceUid: string) {
    const videoRefs = videoRefsRef.current;

    const videoRef = videoRefs[src];

    if (!videoRef) return;

    if (
      videoRef.sourceUids.length === 1 &&
      videoRef.sourceUids[0] === sourceUid
    ) {
      setVideoRefs((videoRefs) => {
        const updatedVideoRefs = { ...videoRefs };
        delete updatedVideoRefs[src];
        return updatedVideoRefs;
      });
    } else {
      setVideoRefs((videoRefs) => ({
        ...videoRefs,
        [src]: {
          ...videoRef,
          sourceUids: without(videoRef.sourceUids, sourceUid),
        },
      }));
    }
  }

  return (
    <VideoPortalContext
      value={{
        videoRefs,
        getPortalNodeForSrc,
        cleanupPortalNodeForSrcIfNeeded,
      }}
    >
      {children}
      {Object.entries(videoRefs).map(([src, { portalNode }]) => (
        <portals.InPortal node={portalNode} key={src}>
          <PortaledPlayer src={src} />
        </portals.InPortal>
      ))}
    </VideoPortalContext>
  );
}

type VideoRefs = Record<
  string,
  {
    sourceUids: string[];
    portalNode: PortalNode;
  }
>;

type PortalNode = portals.HtmlPortalNode<typeof Player>;

interface VideoPortalContextState {
  videoRefs: VideoRefs;
  getPortalNodeForSrc: GetPortalNodeForSrc;
  cleanupPortalNodeForSrcIfNeeded: (src: string, sourceUid: string) => void;
}

type GetPortalNodeForSrc = (
  src: string,
  sourceUid: string,
) => PortalNode | void;

const VideoPortalContext = createContext<VideoPortalContextState>({
  videoRefs: {},
  getPortalNodeForSrc: noop,
  cleanupPortalNodeForSrcIfNeeded: noop,
});

export function useVideoPortalNode(src: string | undefined): PortalNode | void {
  const previousSrcRef = useRef<string | undefined>(src);
  const sourceUid = useId();

  const { getPortalNodeForSrc, cleanupPortalNodeForSrcIfNeeded, videoRefs } =
    useContext(VideoPortalContext);

  // Sometimes useIonViewWillEnter fires after element is already destroyed
  const destroyed = useRef(false);

  const getPortalNodeEvent = useEffectEvent(() => {
    if (destroyed.current) return;
    if (!src) return;

    getPortalNodeForSrc(src, sourceUid);
  });

  const cleanupPortalNodeIfNeededEvent = useEffectEvent(() => {
    destroyed.current = true;
    if (!previousSrcRef.current) return;
    cleanupPortalNodeForSrcIfNeeded(previousSrcRef.current, sourceUid);
  });

  useEffect(() => {
    previousSrcRef.current = src;
    destroyed.current = false;
    getPortalNodeEvent();

    return cleanupPortalNodeIfNeededEvent;
  }, [src]);

  useIonViewWillEnter(() => {
    getPortalNodeEvent();
  });

  if (!src) return;

  const potentialVideoRef = videoRefs[src];

  if (
    potentialVideoRef?.sourceUids &&
    last(potentialVideoRef?.sourceUids) === sourceUid
  )
    return potentialVideoRef.portalNode;
}
