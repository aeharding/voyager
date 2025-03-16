import { IonButton, IonIcon, IonRange } from "@ionic/react";
import { play, volumeHigh, volumeOff } from "ionicons/icons";
import { pause } from "ionicons/icons";
import React, {
  useContext,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useRef,
  useState,
} from "react";

import { back, forward, pip } from "#/features/icons";

import { GalleryContext } from "../GalleryProvider";

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

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setProgress((currentTime / duration) * 100);
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
        {document.pictureInPictureEnabled ? (
          <IonButton
            fill="clear"
            className={styles.playerButton}
            onClick={requestPip}
          >
            <IonIcon size="large" slot="icon-only" icon={pip} />
          </IonButton>
        ) : (
          <div className={styles.buttonPlaceholder} />
        )}

        <div />
        <div />

        <IonButton
          fill="clear"
          className={styles.playerButton}
          onClick={() => skip(-15)}
        >
          <IonIcon
            size="large"
            slot="icon-only"
            icon={back}
            className={styles.skipIcon}
          />
        </IonButton>

        <IonButton
          fill="clear"
          className={styles.playerButton}
          onClick={togglePlayPause}
        >
          <IonIcon
            size="large"
            slot="icon-only"
            // For some reason, Chrome Webview requires a rerender for icon to update??
            key={isPlaying || wasPlayingBeforeScrub ? "pause" : "play"}
            icon={isPlaying || wasPlayingBeforeScrub ? pause : play}
          />
        </IonButton>

        <IonButton
          fill="clear"
          className={styles.playerButton}
          onClick={() => skip(15)}
        >
          <IonIcon
            size="large"
            slot="icon-only"
            icon={forward}
            className={styles.skipIcon}
          />
        </IonButton>

        <div />
        <div />

        <IonButton
          fill="clear"
          className={styles.playerButton}
          onClick={toggleMute}
        >
          <IonIcon
            size="large"
            slot="icon-only"
            icon={isMuted ? volumeOff : volumeHigh}
          />
        </IonButton>
      </div>
      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <IonRange value={progress} min={0} max={100} className={styles.range} />
      </div>
    </div>
  );
}
