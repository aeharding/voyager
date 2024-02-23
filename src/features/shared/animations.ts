const bounceName = "bounce";

const bounce = `
  @keyframes ${bounceName} {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.25);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export const bounceMs = 175;

export const bounceAnimation = `
  ${bounce}

  animation: ${bounceName} ${bounceMs}ms linear;
`;

export const bounceAnimationOnTransition = `
  &.entering {
    ${bounceAnimation}
  }
`;
