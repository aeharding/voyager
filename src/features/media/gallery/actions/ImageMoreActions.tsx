import { styled } from "@linaria/react";

import { isNative } from "#/helpers/device";

import AltText from "./AltText";
import GalleryActions from "./GalleryActions";
import { BottomContainer, BottomContainerActions } from "./shared";

const TopContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 60px;
  padding: 0 1rem;
  margin-top: var(--ion-safe-area-top, env(safe-area-inset-top, 0));

  display: flex;
  align-items: center;

  color: white;

  font-size: 1.5em;
`;

interface ImageMoreActionsProps {
  imgSrc: string;
  alt?: string;
}

export default function ImageMoreActions({
  imgSrc,
  alt,
}: ImageMoreActionsProps) {
  return (
    <>
      {isNative() && (
        <TopContainer>
          <GalleryActions imgSrc={imgSrc} />
        </TopContainer>
      )}
      {alt && (
        <BottomContainer>
          <AltText alt={alt} />
          <BottomContainerActions withBg={false} />
        </BottomContainer>
      )}
    </>
  );
}
