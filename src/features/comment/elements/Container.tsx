import { styled } from "@linaria/react";

export const Container = styled.div<{
  depth: number;
  highlighted?: boolean;
  hidden?: boolean;
  padLeft?: boolean;
  padColor?: string;
}>`
  display: flex;

  position: relative;
  width: 100%;

  gap: 12px;

  font-size: 0.9375em;

  display: flex;
  flex-direction: column;

  padding-left: ${({ padLeft }) => (padLeft ? "1em" : 0)};

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

    background: ${({ padColor }) => padColor || "none"};

    opacity: ${({ hidden }) => (hidden ? 0 : 1)};
  }
`;
