import { css } from "@linaria/core";
import { styled } from "@linaria/react";

import BlurOverlayMessage from "./BlurOverlayMessage";

const BlurContainer = styled.div`
  position: relative;
`;

const blurCss = css`
  filter: blur(40px) brightness(0.8) saturate(1.2);

  // https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
  transform: translate3d(0, 0, 0);
`;

interface BlurOverlayProps extends React.PropsWithChildren {
  blur: boolean;
}

export default function BlurOverlay({ blur, children }: BlurOverlayProps) {
  return (
    <BlurContainer>
      <div className={blur ? blurCss : undefined}>{children}</div>
      {blur && <BlurOverlayMessage />}
    </BlurContainer>
  );
}
