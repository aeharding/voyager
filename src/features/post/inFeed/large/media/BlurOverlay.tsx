import { css } from "@linaria/core";
import { styled } from "@linaria/react";

import useAspectRatio, {
  isLoadedAspectRatio,
} from "#/features/media/useAspectRatio";

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
  src: string;
}

export default function BlurOverlay({ src, children }: BlurOverlayProps) {
  const aspectRatio = useAspectRatio(src);

  // Only blur if image is displayed (loaded)
  const blur = !!isLoadedAspectRatio(aspectRatio);

  return (
    <BlurContainer>
      <div className={blur ? blurCss : undefined}>{children}</div>
      {blur && <BlurOverlayMessage />}
    </BlurContainer>
  );
}
