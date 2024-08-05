import { styled } from "@linaria/react";
import { css, cx } from "@linaria/core";
import { useState } from "react";

const Container = styled.div`
  max-width: 600px;
  width: 100%;
  text-align: center;

  display: flex;
  flex-direction: column;
  align-items: center;

  position: relative;

  // from media/gallery/actions/shared.ts
  margin-bottom: calc(calc(-1 * var(--topPadding)) + 1rem);
`;

const Text = styled.div`
  padding: 5px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.5);

  margin-left: 16px;
  margin-right: 16px;
`;

const Clamped = styled.div``;

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
        <Clamped className={cx(shouldClampAltText && clampCss)}>{alt}</Clamped>
      </Text>
    </Container>
  );
}
