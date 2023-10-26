import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Dictionary } from "@reduxjs/toolkit";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { isAppleDeviceInstallable } from "../../helpers/device";
import { useInView } from "react-intersection-observer";

const Container = styled.div`
  position: relative;
  overflow: hidden;
`;

const Progress = styled.progress`
  position: absolute;
  bottom: -6px;
  right: 0;
  left: 0;
  width: 100%;
  appearance: none;
  height: 12px;
  transform: translate3d(0, 0, 0);

  &::-webkit-progress-bar {
    background: rgba(0, 0, 0, 0.0045);
    backdrop-filter: blur(30px);
  }

  &::-webkit-progress-value {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const VideoEl = styled.video<{ blur?: boolean }>`
  width: 100%;
  max-height: calc(100vh - 60px);
  object-fit: cover;

  overflow: hidden;

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
  const [inViewRef, inView] = useInView({
    threshold: 0.5,
  });
  const videoRef = useRef<HTMLVideoElement>();
  const [progress, setProgress] = useState(0);

  const setRefs = useCallback(
    (node: HTMLVideoElement) => {
      // Ref's from useRef needs to have the node assigned to `current`
      videoRef.current = node;
      // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
      inViewRef(node);
    },
    [inViewRef],
  );

  useEffect(() => {
    if (!videoRef || !videoRef.current) {
      return;
    }

    if (inView) {
      resume();
    } else {
      savePlace();
    }
  }, [inView]);

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

  const videoEl = (
    <Container>
      <VideoEl
        className={className}
        ref={setRefs}
        src={`${src}#t=0.001`}
        blur={blur}
        loop
        muted
        playsInline
        autoPlay={false}
        controls={controls}
        onTimeUpdate={(e: ChangeEvent<HTMLVideoElement>) => {
          setProgress(e.target.currentTime / e.target.duration);
        }}
      />
      <Progress value={progress} />
    </Container>
  );

  return videoEl;
}
