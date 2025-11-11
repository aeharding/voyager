import { useRef } from "react";

import styles from "./VideoActionsProgress.module.css";

interface VideoActionsProgressProps {
  value: number;
  duration: number;
  onStart: () => void;
  onValueChange: (value: number) => void;
  onEnd: () => void;
}

export default function VideoActionsProgress({
  value,
  duration,
  onStart,
  onValueChange,
  onEnd,
}: VideoActionsProgressProps) {
  const initialTouchXRef = useRef(0);
  const initialValueRef = useRef(value);
  const progressBarRef = useRef<HTMLProgressElement>(null);
  const isDraggingRef = useRef(false);

  function handleInteractionStart(clientX: number) {
    isDraggingRef.current = true;
    initialTouchXRef.current = clientX;
    initialValueRef.current = value;
    onStart();
  }

  function handleInteractionEnd() {
    isDraggingRef.current = false;
    onEnd();
  }

  function handleInteractionMove(clientX: number) {
    if (!isDraggingRef.current) return;
    if (!progressBarRef.current) return;

    const initialTouchX = initialTouchXRef.current;
    const initialValue = initialValueRef.current;

    const diffX = clientX - initialTouchX;
    const deltaX = duration / progressBarRef.current.clientWidth;
    const newTime = Math.max(
      0,
      // 0.00001 to make time inclusive of the last frame
      Math.min(duration - 0.00001, initialValue + diffX * deltaX),
    );

    onValueChange(newTime);
  }

  return (
    <div
      className={styles.container}
      onMouseDown={(e) => handleInteractionStart(e.clientX)}
      onMouseUp={handleInteractionEnd}
      onMouseMove={(e) => handleInteractionMove(e.clientX)}
      onTouchStart={(e) => handleInteractionStart(e.touches[0]?.clientX ?? 0)}
      onTouchEnd={handleInteractionEnd}
      onTouchMove={(e) => handleInteractionMove(e.touches[0]?.clientX ?? 0)}
    >
      <progress
        ref={progressBarRef}
        value={value}
        max={duration}
        className={styles.progress}
      />
    </div>
  );
}
