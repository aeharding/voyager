import { styled } from "@linaria/react";
import { css, cx } from "@linaria/core";
import { useState } from "react";

const Container = styled.div`
  max-width: 600px;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;

  position: relative;

  // from media/gallery/actions/shared.ts
  margin-bottom: calc(calc(-1 * var(--topPadding)) + 1rem);
`;

const DynamicHeightBg = styled.div`
  position: absolute;
  inset: 0;

  container-type: size;
`;

const Color = styled.div`
  position: absolute;
  inset: 0;

  // 10px for text margins, plus 5px wiggle
  // 2.4rem = 1.2 line height, two lines
  @container (min-height: calc(15px + 2.4rem)) {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 6px;
    transform: translate3d(0, 0, 0); // safari optimization
  }
`;

const Text = styled.div`
  padding: 5px 10px;
  border-radius: 10px;

  margin-left: 16px;
  margin-right: 16px;

  position: relative;
`;

const Clamped = styled.div`
  position: relative;
`;

const clampCss = css`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`;

interface AltTextProps {
  alt?: string;
}

export default function AltText({ alt }: AltTextProps) {
  const [shouldClampAltText, setShouldClampAltText] = useState(true);

  if (!alt) return;

  return (
    <Container>
      <Text onClick={() => setShouldClampAltText((v) => !v)}>
        <DynamicHeightBg>
          <Color />
        </DynamicHeightBg>
        <Clamped className={cx(shouldClampAltText && clampCss)}>{alt}</Clamped>
      </Text>
    </Container>
  );
}
