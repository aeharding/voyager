import { IonIcon } from "@ionic/react";
import { play, volumeHigh, volumeOff } from "ionicons/icons";
import {
  ChangeEvent,
  CSSProperties,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useInView } from "react-intersection-observer";

import useShouldAutoplay from "#/core/listeners/network/useShouldAutoplay";
import { cx } from "#/helpers/css";
import { stopIonicTapClick } from "#/helpers/ionic";
import { getVideoSrcForUrl } from "#/helpers/url";

import styles from "./Player.module.css";

export interface PlayerProps {
  src: string;

  nativeControls?: boolean;
  progress?: boolean;
  volume?: boolean;
  autoPlay?: boolean;

  className?: string;
  style?: CSSProperties;
  alt?: string;

  ref?: React.RefObject<HTMLVideoElement>;
}

export default function Player({
  src: potentialSrc,
  nativeControls,
  className,
  progress: showProgress = !nativeControls,
  volume = true,
  autoPlay: videoAllowedToAutoplay = true,
  ref,
  ...rest
}: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(undefined);

  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  const shouldAppAutoplay = useShouldAutoplay();
  const autoPlay = shouldAppAutoplay && videoAllowedToAutoplay;
  const [userPaused, setUserPaused] = useState(!autoPlay);
  const wantedToPlayRef = useRef(false);
  const wasAutoPausedRef = useRef(false);

  const src = useMemo(() => getVideoSrcForUrl(potentialSrc), [potentialSrc]);

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement, []);

  const [inViewRef, inView] = useInView({
    threshold: 0.5,
  });
  const [progress, setProgress] = useState<number | undefined>(undefined);

  const showBigPlayButton = userPaused && !playing;

  const setRefs = useCallback(
    (node: HTMLVideoElement) => {
      // Ref's from useRef needs to have the node assigned to `current`
      videoRef.current = node;
      // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
      inViewRef(node);
    },
    [inViewRef],
  );

  const pause = useCallback(() => {
    if (!videoRef.current) return;
    if (userPaused) return;

    wantedToPlayRef.current = false;

    // Hack to prevent audio pause on page transitions
    setTimeout(() => {
      if (wantedToPlayRef.current) return;

      wasAutoPausedRef.current = true;
      videoRef.current?.pause();
    }, 300);
  }, [userPaused]);

  const resume = useCallback(() => {
    if (!videoRef.current) return;
    if (userPaused) return;

    videoRef.current.play();
    wantedToPlayRef.current = true;
    wasAutoPausedRef.current = false;
  }, [userPaused]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (inView) {
      resume();
    } else {
      pause();
    }
  }, [inView, pause, resume]);

  return (
    <span className={cx(styles.container, className)}>
      <video
        {...rest}
        className={styles.videoEl}
        ref={setRefs}
        src={`${src}#t=0.001`}
        loop
        muted={muted}
        playsInline
        onPause={() => {
          setPlaying(false);

          if (!wasAutoPausedRef.current) {
            setUserPaused(true);
          }

          wasAutoPausedRef.current = false;
        }}
        onPlay={() => {
          setPlaying(true);
          setUserPaused(false);
        }}
        onVolumeChange={() => {
          setMuted(!!videoRef.current?.muted);
        }}
        autoPlay={false}
        controls={nativeControls}
        onTimeUpdate={(e: ChangeEvent<HTMLVideoElement>) => {
          if (!showProgress) return;
          setProgress(e.target.currentTime / e.target.duration);
        }}
        aria-label={rest.alt}
      />
      {showProgress && progress !== undefined && (
        <progress className={styles.progress} value={progress} />
      )}
      {!nativeControls && (
        <>
          {!showBigPlayButton && volume && (
            <button
              className={styles.volumeButton}
              onClick={(e) => {
                setMuted(!muted);
                if (videoRef.current) videoRef.current.muted = !muted;

                e.preventDefault(); // reverse-portal
                e.stopPropagation(); // video in comments
              }}
              onTouchStart={() => {
                // weird reverse portal event dispatching (see OutPortalEventDispatcher)
                requestAnimationFrame(() => stopIonicTapClick());
              }}
            >
              <IonIcon icon={muted ? volumeOff : volumeHigh} />
            </button>
          )}
          {showBigPlayButton && (
            <span
              className={styles.playOverlay}
              onClick={(e) => {
                e.preventDefault(); // reverse-portal
                e.stopPropagation(); // video in comments

                videoRef.current?.play();
              }}
            >
              <IonIcon icon={play} />
            </span>
          )}
        </>
      )}
    </span>
  );
}
