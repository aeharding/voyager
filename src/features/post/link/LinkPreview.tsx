import { styled } from "@linaria/react";
import { IonIcon } from "@ionic/react";
import {
  albumsOutline,
  chatboxSharp,
  linkSharp,
  peopleSharp,
  personSharp,
} from "ionicons/icons";
import { getImageSrc } from "../../../services/lemmy";
import { ReactNode, useMemo } from "react";
import useLemmyUrlHandler from "../../shared/useLemmyUrlHandler";
import { isUrlImage } from "../../../helpers/url";

const shared = `
  width: 30px;
  height: 30px;
  box-sizing: content-box;

  padding-right: 6px;
  margin-right: 2px;
  border-right: 1px solid rgba(160, 160, 160, 0.4);
`;

const LinkIcon = styled(IonIcon)`
  ${shared}

  font-size: 30px;
  opacity: 0.5;
`;

const LinkImage = styled.img`
  ${shared}

  object-fit: cover;
`;

interface LinkPreviewProps {
  url: string;
  thumbnail?: string;
  type?: string;
  text?: string;
}

export default function LinkPreview({
  url,
  thumbnail,
  type,
  text,
}: LinkPreviewProps): ReactNode {
  const { determineObjectTypeFromUrl } = useLemmyUrlHandler();

  const icon = useMemo(() => {
    const type = determineObjectTypeFromUrl(url);

    switch (type) {
      case "comment":
        return chatboxSharp;
      case "community":
        return peopleSharp;
      case "post":
        return albumsOutline;
      case "user":
        return personSharp;
      case undefined:
        return linkSharp;
    }
  }, [url, determineObjectTypeFromUrl]);

  const isImage = useMemo(() => isUrlImage(url), [url]);

  if (type === "image" || isImage)
    return (
      <LinkImage src={getImageSrc(thumbnail ?? url, { size: 30 })} alt={text} />
    );

  if (type === "link" || !type) return <LinkIcon icon={icon} />;
}
