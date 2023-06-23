import styled from "@emotion/styled";
import { useIonViewWillEnter, useIonViewWillLeave } from "@ionic/react";
import { Dictionary } from "@reduxjs/toolkit";
import { useEffect, useRef } from "react";

const VideoEl = styled.video`
  width: 100%;
`;

interface VideoProps {
  src: string;

  className?: string;
}

const videoPlaybackPlace: Dictionary<number> = {};

export default function Video({ src, className }: VideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useIonViewWillLeave(() => {
    savePlace();
  });

  useIonViewWillEnter(() => {
    resume();
  });

  useEffect(() => {
    resume();

    return () => {
      savePlace();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function savePlace() {
    if (!videoRef.current) return;

    videoPlaybackPlace[src] = videoRef.current.currentTime;
    videoRef.current.pause();
  }

  function resume() {
    if (!videoRef.current) return;

    videoRef.current.currentTime = videoPlaybackPlace[src] ?? 0;
    videoRef.current.play();
  }

  return (
    <VideoEl
      className={className}
      ref={videoRef}
      src={src}
      width="100%"
      controls
      loop
      muted
    />
  );
}
