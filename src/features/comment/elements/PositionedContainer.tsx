import { styled } from "@linaria/react";

import { maxWidthCss } from "#/features/shared/AppContent";

export const PositionedContainer = styled.div<{
  depth: number;
}>`
  position: relative;

  ${maxWidthCss}

  padding: 8px 12px;

  @media (hover: none) {
    padding-top: 0.65em;
    padding-bottom: 0.65em;
  }

  padding-left: calc(
    12px + max(0px, calc(calc(${({ depth }) => depth} - 1) * 10px))
  );
`;
