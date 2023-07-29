import { css, keyframes } from "@emotion/react";

const bounce = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
`;

export const bounceMs = 175;

export const bounceAnimation = css`
  animation: ${bounce} ${bounceMs}ms linear;
`;

export const bounceAnimationOnTransition = css`
  &.entering {
    ${bounceAnimation}
  }
`;
