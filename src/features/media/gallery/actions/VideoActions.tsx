import { IonButton, IonIcon, IonRange } from "@ionic/react";
import { play } from "ionicons/icons";
import { pause } from "ionicons/icons";
import React, {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useRef,
  useState,
} from "react";

import styles from "./VideoActions.module.css";

interface VideoActionsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
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
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setupEvent();

    return teardownEvent;
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      setIsPlaying(!videoRef.current.paused);
    }
  }, [videoRef]);

  function setup() {
    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
      videoRef.current.addEventListener("play", handlePlay);
      videoRef.current.addEventListener("pause", handlePause);
    }
  }

  function teardown() {
    if (videoRef.current) {
      videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      videoRef.current.removeEventListener("play", handlePlay);
      videoRef.current.removeEventListener("pause", handlePause);
    }
  }

  function handleTimeUpdate() {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((currentTime / duration) * 100);
    }
  }

  function handlePlay() {
    setIsPlaying(true);
  }

  function handlePause() {
    setIsPlaying(false);
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

  function handleMouseDown() {
    setIsDragging(true);
  }

  function handleMouseUp() {
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
    setIsDragging(true);
  }

  function handleTouchEnd() {
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

  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        <IonButton fill="clear" color="dark" onClick={togglePlayPause}>
          <IonIcon
            size="large"
            slot="icon-only"
            icon={isPlaying ? pause : play}
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
