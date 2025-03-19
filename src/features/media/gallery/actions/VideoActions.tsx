import { IonIcon } from "@ionic/react";
import { play, volumeHigh, volumeOff } from "ionicons/icons";
import { pause } from "ionicons/icons";
import React, {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useRef,
  useState,
} from "react";

import VideoActionsProgress from "./VideoActionsProgress";

import styles from "./VideoActions.module.css";

interface VideoActionsProps {
  videoRef: React.RefObject<HTMLVideoElement | undefined>;
}

export default function VideoActionsLoader({ videoRef }: VideoActionsProps) {
  const [isReady, setIsReady] = useState(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    let done = false;

    const startAnimation = () => {
      rafId.current = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!done) {
            setIsReady(true);
          }
        });
      });
    };

    startAnimation();

    return () => {
      done = true;
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return isReady ? <VideoActions videoRef={videoRef} /> : null;
}

function VideoActions({ videoRef }: VideoActionsProps) {
  const setupEvent = useEffectEvent(setup);
  const teardownEvent = useEffectEvent(teardown);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setupEvent();

    return teardownEvent;
  }, []);

  function setup() {
    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
      videoRef.current.addEventListener("play", handlePlay);
      videoRef.current.addEventListener("pause", handlePause);
      videoRef.current.addEventListener("volumechange", handleVolumeChange);

      setIsPlaying(!videoRef.current.paused);
      setIsMuted(videoRef.current.muted);

      handleTimeUpdate();
    }
  }

  function teardown() {
    if (videoRef.current) {
      videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      videoRef.current.removeEventListener("play", handlePlay);
      videoRef.current.removeEventListener("pause", handlePause);
      videoRef.current.removeEventListener("volumechange", handleVolumeChange);
    }
  }

  function handleTimeUpdate() {
    if (!videoRef.current) return;

    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration);
  }

  function handlePlay() {
    setIsPlaying(true);
    setWasPlayingBeforeScrub(false);
  }

  function handlePause() {
    setIsPlaying(false);
  }

  function handleVolumeChange() {
    setIsMuted(videoRef.current?.muted ?? false);
  }

  function togglePlayPause() {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }

  function onScrubStart() {
    if (!videoRef.current) return;

    setWasPlayingBeforeScrub(!videoRef.current.paused);
    videoRef.current.pause();
  }

  function onScrub(value: number) {
    if (!videoRef.current) return;

    videoRef.current.currentTime = value;
    setCurrentTime(value);
  }

  function onScrubEnd() {
    if (!videoRef.current) return;
    if (!wasPlayingBeforeScrub) return;

    videoRef.current.play();
  }

  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        <button className={styles.playerButton} onClick={togglePlayPause}>
          <IonIcon
            slot="icon-only"
            // For some reason, Chrome Webview requires a rerender for icon to update??
            key={isPlaying || wasPlayingBeforeScrub ? "pause" : "play"}
            icon={isPlaying || wasPlayingBeforeScrub ? pause : play}
          />
        </button>

        <button className={styles.playerButton} onClick={toggleMute}>
          <IonIcon slot="icon-only" icon={isMuted ? volumeOff : volumeHigh} />
        </button>
      </div>

      <VideoActionsProgress
        value={currentTime}
        duration={duration}
        onStart={onScrubStart}
        onValueChange={onScrub}
        onEnd={onScrubEnd}
      />
    </div>
  );
}
