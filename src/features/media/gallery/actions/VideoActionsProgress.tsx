import styles from "./VideoActionsProgress.module.css";

interface VideoActionsProgressProps {
  value: number;
  duration: number;
  onValueChange: (value: number) => void;
}

export default function VideoActionsProgress({
  value,
  duration,
  onValueChange,
}: VideoActionsProgressProps) {
  return (
    <div className={styles.container}>
      <progress value={value} max={duration} className={styles.progress} />
    </div>
  );
}
{
  /* <div
  onMouseDown={handleMouseDown}
  onMouseUp={handleMouseUp}
  onMouseMove={handleMouseMove}
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  onTouchMove={handleTouchMove}
></div>; */
}
