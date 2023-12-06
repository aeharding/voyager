import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { ReactNode } from "react";
import BlurOverlayMessage from "./BlurOverlayMessage";

const BlurContainer = styled.div`
  position: relative;
`;

const BlurContents = styled.div<{ blur: boolean }>`
  ${({ blur }) =>
    blur &&
    css`
      filter: blur(40px) brightness(0.8) saturate(1.2);

      // https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
      transform: translate3d(0, 0, 0);
    `}
`;

interface BlurOverlayProps {
  blur: boolean;
  children: ReactNode;
}

export default function BlurOverlay({ blur, children }: BlurOverlayProps) {
  return (
    <BlurContainer>
      <BlurContents blur={blur}>{children}</BlurContents>
      {blur && <BlurOverlayMessage />}
    </BlurContainer>
  );
}
