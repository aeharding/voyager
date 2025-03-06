import { useIonViewWillEnter } from "@ionic/react";
import { noop } from "es-toolkit";
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
      if (potentialExisting.sourceUid !== sourceUid) {
        setVideoRefs((videoRefs) => ({
          ...videoRefs,
          [src]: { ...potentialExisting, sourceUid },
        }));
      }

      return potentialExisting.portalNode;
    }

    const newRef = {
      sourceUid,
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

    // Portal was handed off to another OutPortal.
    // Some other portal outlet is controlling, so not responsible for cleanup
    if (videoRefs[src]?.sourceUid !== sourceUid) return;

    setVideoRefs((videoRefs) => {
      const updatedVideoRefs = { ...videoRefs };
      delete updatedVideoRefs[src];
      return updatedVideoRefs;
    });
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
    sourceUid: string;
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

export function useVideoPortalNode(src: string): PortalNode | void {
  const sourceUid = useId();

  const { getPortalNodeForSrc, cleanupPortalNodeForSrcIfNeeded, videoRefs } =
    useContext(VideoPortalContext);

  // Sometimes useIonViewWillEnter fires after element is already destroyed
  const destroyed = useRef(false);

  const getPortalNodeEvent = useEffectEvent(() => {
    if (destroyed.current) return;

    getPortalNodeForSrc(src, sourceUid);
  });

  const cleanupPortalNodeIfNeededEvent = useEffectEvent(() => {
    destroyed.current = true;
    cleanupPortalNodeForSrcIfNeeded(src, sourceUid);
  });

  useEffect(() => {
    destroyed.current = false;
    getPortalNodeEvent();

    return cleanupPortalNodeIfNeededEvent;
  }, []);

  useIonViewWillEnter(() => {
    getPortalNodeEvent();
  });

  const potentialVideoRef = videoRefs[src];

  if (potentialVideoRef?.sourceUid === sourceUid)
    return potentialVideoRef.portalNode;
}
