import { styled } from "@linaria/react";

const FakeIconContainer = styled.div<{ bg: string; size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background-color: ${({ bg }) => bg};
  color: white;
`;

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
  return (
    <FakeIconContainer
      bg={generateRandomColor(seed)}
      size={size ?? 20}
      className={className}
      slot={slot}
    >
      {name.slice(0, 1).toUpperCase()}
    </FakeIconContainer>
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
