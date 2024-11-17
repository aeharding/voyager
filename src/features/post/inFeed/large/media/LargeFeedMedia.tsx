import { css } from "@linaria/core";

import InlineMedia, { InlineMediaProps } from "#/features/media/InlineMedia";

import BlurOverlay from "./BlurOverlay";

export const fullWidthPostStyles = css`
  display: flex;
  width: 100%;
  max-width: none;
  max-height: max(100vh, 1000px);
  object-fit: contain;
  -webkit-touch-callout: default;

  min-height: 0;
`;

interface LargeFeedMediaProps extends InlineMediaProps {
  blur?: boolean;
}

export default function LargeFeedMedia({
  blur,
  ...props
}: LargeFeedMediaProps) {
  const contents = (
    <InlineMedia {...props} mediaClassName={fullWidthPostStyles} />
  );

  if (!blur) return contents; // optimization

  return <BlurOverlay blur={blur /*&& loaded*/}>{contents}</BlurOverlay>;
}
