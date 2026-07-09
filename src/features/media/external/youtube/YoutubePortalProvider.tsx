import { last, noop, without } from "es-toolkit";
import {
  createContext,
  createRef,
  RefObject,
  use,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import styles from "./YoutubePortalProvider.module.css";

interface VideoEntry {
  consumerUids: string[];
  slotRefs: Record<string, RefObject<HTMLElement | null>>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
}

type VideoEntries = Record<string, VideoEntry>;

interface YoutubePortalContextState {
  entries: VideoEntries;
  acquire: (
    videoId: string,
    uid: string,
    slotRef: RefObject<HTMLElement | null>,
  ) => void;
  release: (videoId: string, uid: string) => void;
}

const YoutubePortalContext = createContext<YoutubePortalContextState>({
  entries: {},
  acquire: noop,
  release: noop,
});

export default function YoutubePortalProvider({
  children,
}: React.PropsWithChildren) {
  const [entries, _setEntries] = useState<VideoEntries>({});
  const entriesRef = useRef(entries);

  function setEntries(next: VideoEntries) {
    entriesRef.current = next;
    _setEntries(next);
  }

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const acquire: YoutubePortalContextState["acquire"] = (
    videoId,
    uid,
    slotRef,
  ) => {
    const current = entriesRef.current;
    const existing = current[videoId];
    if (existing) {
      setEntries({
        ...current,
        [videoId]: {
          ...existing,
          consumerUids: [...without(existing.consumerUids, uid), uid],
          slotRefs: { ...existing.slotRefs, [uid]: slotRef },
        },
      });
      return;
    }
    const entry: VideoEntry = {
      consumerUids: [uid],
      slotRefs: { [uid]: slotRef },
      iframeRef: createRef<HTMLIFrameElement>(),
    };
    setEntries({ ...current, [videoId]: entry });
  };

  const release: YoutubePortalContextState["release"] = (videoId, uid) => {
    const current = entriesRef.current;
    const existing = current[videoId];
    if (!existing) return;
    const remainingUids = without(existing.consumerUids, uid);
    if (remainingUids.length === 0) {
      const next = { ...current };
      delete next[videoId];
      setEntries(next);
      return;
    }
    const nextSlotRefs = { ...existing.slotRefs };
    delete nextSlotRefs[uid];
    setEntries({
      ...current,
      [videoId]: {
        ...existing,
        consumerUids: remainingUids,
        slotRefs: nextSlotRefs,
      },
    });
  };

  // RAF loop: position each iframe over its currently-active consumer slot.
  // Direct DOM mutation — no React re-renders per frame.
  useEffect(() => {
    let raf = 0;
    function tick() {
      const current = entriesRef.current;
      for (const [, entry] of Object.entries(current)) {
        const iframe = entry.iframeRef.current;
        if (!iframe) continue;

        const activeUid = last(entry.consumerUids);
        const slot = activeUid ? entry.slotRefs[activeUid]?.current : null;

        if (!slot) {
          if (!iframe.classList.contains(styles.hidden!)) {
            iframe.classList.add(styles.hidden!);
          }
          continue;
        }

        const rect = slot.getBoundingClientRect();
        const visible = rect.width > 0 && rect.height > 0;
        if (!visible) {
          if (!iframe.classList.contains(styles.hidden!)) {
            iframe.classList.add(styles.hidden!);
          }
          continue;
        }

        if (iframe.classList.contains(styles.hidden!)) {
          iframe.classList.remove(styles.hidden!);
        }
        iframe.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
        iframe.style.width = `${rect.width}px`;
        iframe.style.height = `${rect.height}px`;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <YoutubePortalContext value={{ entries, acquire, release }}>
      {children}
      <div className={styles.overlay} aria-hidden>
        {Object.entries(entries).map(([videoId, { iframeRef }]) => (
          <iframe
            key={videoId}
            ref={iframeRef}
            className={styles.iframe}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title="YouTube video"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ))}
      </div>
    </YoutubePortalContext>
  );
}

export function useYoutubePortal(videoId: string | undefined) {
  const outPortalUid = useId();
  const { entries, acquire, release } = use(YoutubePortalContext);

  const entry = videoId ? entries[videoId] : undefined;
  const hasActive = !!entry;

  return {
    outPortalUid,
    hasActive,
    acquire: (slotRef: RefObject<HTMLElement | null>) => {
      if (videoId) acquire(videoId, outPortalUid, slotRef);
    },
    release: () => {
      if (videoId) release(videoId, outPortalUid);
    },
  };
}
