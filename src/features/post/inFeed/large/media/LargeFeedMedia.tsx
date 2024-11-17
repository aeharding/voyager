import { css } from "@linaria/core";

import StableSizeMedia, {
  StableSizeMediaProps,
} from "#/features/media/StableSizeMedia";

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

interface LargeFeedMediaProps extends StableSizeMediaProps {
  blur?: boolean;
}

export default function LargeFeedMedia({
  blur,
  ...props
}: LargeFeedMediaProps) {
  const contents = (
    <StableSizeMedia {...props} nativeElmClassName={fullWidthPostStyles} />
  );

  if (!blur) return contents; // optimization

  return <BlurOverlay blur={blur /*&& loaded*/}>{contents}</BlurOverlay>;
}
