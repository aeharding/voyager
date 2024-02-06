import styled from "@emotion/styled";
import {
  CSSProperties,
  ChangeEvent,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useInView } from "react-intersection-observer";
import useShouldAutoplay from "../../../listeners/network/useShouldAutoplay";
import { css } from "@emotion/react";

const Container = styled.div`
  position: relative;
  overflow: hidden;

  display: flex;
`;

const sharedProgressBarCss = css`
  background: rgba(0, 0, 0, 0.0045);
  backdrop-filter: blur(30px);
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

  background: none;
  border: 0;

  &::-webkit-progress-bar {
    ${sharedProgressBarCss}
  }

  @supports selector(::-moz-progress-bar) {
    ${sharedProgressBarCss}
  }

  &::-moz-progress-bar {
    background: rgba(255, 255, 255, 0.3);
  }

  &::-webkit-progress-value {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const VideoEl = styled.video`
  flex: 1;

  width: 100%;
  object-fit: contain;

  overflow: hidden;
`;

export interface PlayerProps {
  src: string;

  controls?: boolean;
  progress?: boolean;
  autoPlay?: boolean;

  className?: string;
  style?: CSSProperties;
}

const Player = forwardRef<HTMLVideoElement, PlayerProps>(function Player(
  {
    src,
    controls,
    className,
    progress: showProgress = !controls,
    autoPlay: videoAllowedToAutoplay = true,
    ...rest
  },
  forwardedRef,
) {
  const videoRef = useRef<HTMLVideoElement>();
  const shouldAutoplay = useShouldAutoplay();
  const autoPlay = shouldAutoplay && videoAllowedToAutoplay;
  const wantedToPlayRef = useRef(false);

  useImperativeHandle(
    forwardedRef,
    () => videoRef.current as HTMLVideoElement,
    [],
  );

  const [inViewRef, inView] = useInView({
    threshold: 0.5,
  });
  const [progress, setProgress] = useState<number | undefined>(undefined);

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
    if (!autoPlay) return;

    wantedToPlayRef.current = false;

    setTimeout(() => {
      if (wantedToPlayRef.current) return;

      videoRef.current?.pause();
    }, 300);
  }, [autoPlay]);

  const resume = useCallback(() => {
    if (!videoRef.current) return;
    if (!autoPlay) return;

    videoRef.current.play();
    wantedToPlayRef.current = true;
  }, [autoPlay]);

  useEffect(() => {
    if (!videoRef || !videoRef.current) {
      return;
    }

    if (inView) {
      resume();
    } else {
      pause();
    }
  }, [inView, pause, resume]);

  return (
    <Container className={className}>
      <VideoEl
        ref={setRefs}
        src={`${src}#t=0.001`}
        loop
        muted
        playsInline
        autoPlay={false}
        controls={controls}
        onTimeUpdate={(e: ChangeEvent<HTMLVideoElement>) => {
          if (!showProgress) return;
          setProgress(e.target.currentTime / e.target.duration);
        }}
        {...rest}
      />
      {showProgress && progress !== undefined && <Progress value={progress} />}
    </Container>
  );
});

export default memo(Player);