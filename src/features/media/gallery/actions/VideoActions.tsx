import { IonButton, IonIcon } from "@ionic/react";
import { play, volumeHigh, volumeOff } from "ionicons/icons";
import { pause } from "ionicons/icons";
import React, {
  useContext,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useRef,
  useState,
} from "react";

import { pip } from "#/features/icons";

import { GalleryContext } from "../GalleryProvider";
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
  const { close } = useContext(GalleryContext);
  const setupEvent = useEffectEvent(setup);
  const teardownEvent = useEffectEvent(teardown);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
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

    setProgress(videoRef.current.currentTime);
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

  function handleMouseDown() {
    if (videoRef.current) {
      setWasPlayingBeforeScrub(!videoRef.current.paused);
      videoRef.current.pause();
    }
    setIsDragging(true);
  }

  function handleMouseUp() {
    if (wasPlayingBeforeScrub && videoRef.current) {
      videoRef.current.play();
    }
    setIsDragging(false);
  }

  function handleMouseMove(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) {
    if (isDragging && videoRef.current) {
      const progressBar = event.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const newTime = (offsetX / rect.width) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress((newTime / videoRef.current.duration) * 100);
    }
  }

  function handleTouchStart() {
    if (videoRef.current) {
      setWasPlayingBeforeScrub(!videoRef.current.paused);
      videoRef.current.pause();
    }
    setIsDragging(true);
  }

  function handleTouchEnd() {
    if (wasPlayingBeforeScrub && videoRef.current) {
      videoRef.current.play();
    }
    setIsDragging(false);
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (isDragging && videoRef.current) {
      const touch = event.touches[0];
      if (touch) {
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const offsetX = touch.clientX - rect.left;
        const newTime = (offsetX / rect.width) * videoRef.current.duration;
        videoRef.current.currentTime = newTime;
        setProgress((newTime / videoRef.current.duration) * 100);
      }
    }
  }

  async function requestPip() {
    if (!videoRef.current) return;

    await videoRef.current.requestPictureInPicture();
    close();
  }

  function skip(seconds: number) {
    if (!videoRef.current) return;

    videoRef.current.currentTime += seconds;
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
        value={progress}
        duration={duration}
        onValueChange={() => {}}
      />
    </div>
  );
}
