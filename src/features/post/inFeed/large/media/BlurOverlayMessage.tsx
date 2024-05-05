import { IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";
import { alertCircle } from "ionicons/icons";
import {
  LARGE_POST_MEDIA_CONTAINER_CLASSNAME,
  LARGE_POST_MEDIA_CONTAINER_HIDDEN_CLASSNAME,
} from "../LargePostContents";

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
  color: white;

  // Allow tap through to the media viewer
  pointer-events: none;

  container-type: size;

  .${LARGE_POST_MEDIA_CONTAINER_CLASSNAME}.${LARGE_POST_MEDIA_CONTAINER_HIDDEN_CLASSNAME}
    & {
    visibility: hidden;
  }
`;

const WarningIcon = styled(IonIcon)`
  font-size: 42px;
`;

const showIfTaller = `
  @container (min-height: 150px) {
    display: block;
  }
`;

const Title = styled.div`
  font-size: 1.2em;
  font-weight: 600;

  margin-top: 8px;

  display: none;

  ${showIfTaller}
`;

const Description = styled.div`
  font-size: 0.875em;
  opacity: 0.7;

  display: none;

  ${showIfTaller}
`;

export default function BlurOverlayMessage() {
  return (
    <MessageContainer>
      <WarningIcon icon={alertCircle} />
      <Title>NSFW</Title>
      <Description>Sensitive content — tap to view</Description>
    </MessageContainer>
  );
}
