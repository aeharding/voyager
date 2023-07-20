import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useIonViewWillEnter, useIonViewWillLeave } from "@ionic/react";
import { Dictionary } from "@reduxjs/toolkit";
import { useEffect, useRef } from "react";

const VideoEl = styled.video<{ blur?: boolean }>`
  width: 100%;

  ${({ blur }) =>
    blur &&
    css`
      filter: blur(40px);

      // https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
      transform: translate3d(0, 0, 0);
    `}
`;

interface VideoProps {
  src: string;
  controls?: boolean;

  blur?: boolean;

  className?: string;
}

const videoPlaybackPlace: Dictionary<number> = {};

export default function Video({ src, controls, blur, className }: VideoProps) {
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
    if (blur) return;

    videoPlaybackPlace[src] = videoRef.current.currentTime;
    videoRef.current.pause();
  }

  function resume() {
    if (!videoRef.current) return;
    if (blur) return;

    videoRef.current.currentTime = videoPlaybackPlace[src] ?? 0;
    videoRef.current.play();
  }

  return (
    <VideoEl
      className={className}
      ref={videoRef}
      src={src}
      blur={blur}
      loop
      muted
      playsInline
      autoPlay={!blur}
      controls={controls}
    />
  );
}
