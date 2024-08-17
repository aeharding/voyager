import { styled } from "@linaria/react";
import { IonIcon } from "@ionic/react";
import {
  albumsOutline,
  chatboxSharp,
  linkSharp,
  mailOpen,
  peopleSharp,
  personSharp,
} from "ionicons/icons";
import { ReactNode, useMemo } from "react";
import { LemmyObjectType } from "../../shared/useLemmyUrlHandler";
import type { determineTypeFromUrl } from "../../../helpers/url";

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
  type: LemmyObjectType | ReturnType<typeof determineTypeFromUrl>;
}

export default function LinkPreview({ type }: LinkPreviewProps): ReactNode {
  const icon = useMemo(() => {
    switch (type) {
      case "comment":
        return chatboxSharp;
      case "community":
        return peopleSharp;
      case "post":
        return albumsOutline;
      case "user":
        return personSharp;
      case "mail":
        return mailOpen;
      case undefined:
        return linkSharp;
    }
  }, [type]);

  return <LinkIcon icon={icon} />;
}
