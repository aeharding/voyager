import { styled } from "@linaria/react";

const rainbowColors = [
  "#FF0000", // Red
  "#FF7F00", // Orange
  "#e1ca00", // Yellow
  "#00dd00", // Green
  "#0000FF", // Blue
  "#4B0082", // Indigo
  "#8B00FF", // Violet
  "#FF00FF", // Magenta
  "#FF1493", // Deep Pink
  "#00FFFF", // Cyan
];

export const Container = styled.div<{
  depth: number;
  highlighted?: boolean;
  hidden?: boolean;
}>`
  display: flex;

  position: relative;
  width: 100%;

  gap: 12px;

  font-size: 0.9375em;

  display: flex;
  flex-direction: column;

  padding-left: ${({ depth }) => (depth > 0 ? "1em" : 0)};

  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    filter: none;

    .theme-dark & {
      filter: brightness(0.7);
    }

    background: ${({ depth }) =>
      depth ? rainbowColors[depth % rainbowColors.length]! : "none"};

    opacity: ${({ hidden }) => (hidden ? 0 : 1)};
  }
`;
