import { IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";

const marginCss = `margin: calc(-1 * var(--top-padding)) 0 calc(-1 * var(--top-padding))
    calc(-1 * var(--start-padding));`;

const Rel = styled.div`
  position: relative;
  height: var(--height);

  ${marginCss}
`;

const Img = styled.img`
  ${marginCss}

  ${Rel} > & {
    margin: 0;
  }

  height: var(--height);
  aspect-ratio: 0.85;
  width: auto;
  object-fit: cover;
`;

const OverlayIcon = styled(IonIcon)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  color: #cdcdcd;
  opacity: 0.7;
  font-size: 35px;
`;

interface ThumbnailImgProps {
  src?: string;
  icon?: string;
}

export default function ThumbnailImg({ icon, ...props }: ThumbnailImgProps) {
  if (icon) {
    return (
      <Rel>
        <Img {...props} />
        <OverlayIcon icon={icon} />
      </Rel>
    );
  }

  return <Img {...props} />;
}
