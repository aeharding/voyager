import { cx } from "#/helpers/css";

import styles from "./FakeIcon.module.css";

interface FakeIconProps {
  seed: string | number;
  size?: number;
  name: string;
  className?: string;
  slot?: string;
}

export default function FakeIcon({
  seed,
  size,
  className,
  name,
  slot,
}: FakeIconProps) {
  const cssSize = `${size ?? 20}px`;

  return (
    <div
      style={{
        backgroundColor: generateRandomColor(seed),
        width: cssSize,
        height: cssSize,
      }}
      className={cx(className, styles.container)}
      slot={slot}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function generateRandomColor(seed: string | number): string {
  // Convert seed to a numeric value
  let num: number;
  if (typeof seed === "number") {
    num = seed;
  } else {
    num = 0;
    for (let i = 0; i < seed.length; i++) {
      num += seed.charCodeAt(i);
    }
  }

  // Generate random RGB values
  const random = (num: number) => {
    const x = Math.sin(num) * 10000;
    return Math.floor((x - Math.floor(x)) * 256);
  };

  const red = random(num);
  const green = random(num + 1);
  const blue = random(num + 2);

  // Format RGB values into hexadecimal color
  const rgb = (red << 16) | (green << 8) | blue;
  const hexColor = `#${(rgb | 0x1000000).toString(16).substring(1)}`;

  return hexColor;
}
