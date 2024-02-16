import { styled } from "@linaria/react";
import { IonIcon } from "@ionic/react";
import { LinkData } from "./CommentLinks";
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
  link: LinkData;
}

export default function LinkPreview({ link }: LinkPreviewProps): ReactNode {
  const { determineObjectTypeFromUrl } = useLemmyUrlHandler();

  const icon = useMemo(() => {
    const type = determineObjectTypeFromUrl(link.url);

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
  }, [link.url, determineObjectTypeFromUrl]);

  const isImage = useMemo(() => isUrlImage(link.url), [link.url]);

  if (link.type === "image" || isImage)
    return (
      <LinkImage src={getImageSrc(link.url, { size: 30 })} alt={link.text} />
    );

  if (link.type === "link") return <LinkIcon icon={icon} />;
}
