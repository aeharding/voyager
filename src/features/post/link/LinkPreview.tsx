import { styled } from "@linaria/react";
import { IonIcon } from "@ionic/react";
import {
  albumsOutline,
  chatboxSharp,
  linkSharp,
  peopleSharp,
  personSharp,
} from "ionicons/icons";
import { ReactNode, useMemo } from "react";
import useLemmyUrlHandler from "../../shared/useLemmyUrlHandler";

const shared = `
  width: 26px;
  height: 30px;
  box-sizing: content-box;

  padding-right: var(--gap);
  margin-right: 2px;
  border-right: 1px solid rgba(160, 160, 160, 0.7);
`;

const LinkIcon = styled(IonIcon)`
  ${shared}

  font-size: 26px;
  opacity: 0.7;
`;

interface LinkPreviewProps {
  url: string;
}

export default function LinkPreview({ url }: LinkPreviewProps): ReactNode {
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

  return <LinkIcon icon={icon} />;
}
