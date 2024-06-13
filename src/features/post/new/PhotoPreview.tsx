import { styled } from "@linaria/react";
import { IonSpinner } from "@ionic/react";
import { isUrlVideo } from "../../../helpers/url";
import { useRef } from "react";

const Container = styled.div`
  position: relative;
`;

const Img = styled.video<{ loadingImage: boolean }>`
  max-width: 100px;
  max-height: 100px;
  padding: 1rem;

  filter: ${({ loadingImage }) =>
    loadingImage ? "blur(5px) brightness(0.5)" : "none"};
`;

const OverlaySpinner = styled(IonSpinner)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

interface PhotoPreviewProps {
  src: string;
  isVideo?: boolean;
  loading: boolean;
}

export default function PhotoPreview({
  src,
  isVideo,
  loading,
}: PhotoPreviewProps) {
  const videoTag = isVideo || isUrlVideo(src);
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <Container>
      <Img
        ref={ref}
        src={src}
        playsInline
        muted
        autoPlay
        onPlaying={(e) => {
          if (!(e.target instanceof HTMLVideoElement)) return;

          // iOS won't show preview unless the video plays
          e.target.pause();
        }}
        loadingImage={loading}
        /* Just uploaded blob (can't detect type from url), or editing post w/ media lemmy url (can) */
        as={videoTag ? "video" : "img"}
      />
      {loading && <OverlaySpinner />}
    </Container>
  );
}
