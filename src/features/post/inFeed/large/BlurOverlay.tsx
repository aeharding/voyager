import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { alertCircle } from "ionicons/icons";
import { ReactNode } from "react";

const BlurContainer = styled.div`
  position: relative;
`;

const BlurContents = styled.div<{ blur: boolean }>`
  ${({ blur, theme }) =>
    blur &&
    css`
      filter: blur(40px) brightness(${theme.dark ? 0.8 : 1.2});

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

const MessageContainer = styled.div`
  // Safari bug where absolutely positioned content isn't viewable over
  // transform: translate3d(0, 0, 0) from <BlurContents>
  transform: translate3d(0, 0, 0);

  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;

  text-align: center;

  // Allow tap through to the media viewer
  pointer-events: none;
`;

const WarningIcon = styled(IonIcon)`
  font-size: 42px;
  margin-bottom: 8px;
`;

const Title = styled.div`
  font-size: 1.2em;
  font-weight: 600;
`;

const Description = styled.div`
  font-size: 0.875em;
  opacity: 0.7;
`;

function BlurOverlayMessage() {
  return (
    <MessageContainer>
      <WarningIcon icon={alertCircle} />
      <Title>NSFW</Title>
      <Description>Sensitive content — tap to view</Description>
    </MessageContainer>
  );
}
