import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { LinkData } from "./CommentLinks";
import {
  albumsOutline,
  chatboxSharp,
  linkSharp,
  peopleSharp,
  personSharp,
} from "ionicons/icons";
import { css } from "@emotion/react";
import { getImageSrc } from "../../../services/lemmy";
import { ReactNode, useMemo } from "react";
import {
  COMMENT_PATH,
  POST_PATH,
  USER_PATH,
  matchLemmyCommunity,
} from "../../shared/markdown/LinkInterceptor";
import { useAppSelector } from "../../../store";
import { isUrlImage } from "../../../helpers/lemmy";
import { knownInstancesSelector } from "../../instances/instancesSlice";

const shared = css`
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
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const knownInstances = useAppSelector(knownInstancesSelector);

  const icon = useMemo(() => {
    const url = new URL(link.url, `https://${connectedInstance}`);

    if (matchLemmyCommunity(url.pathname)) return peopleSharp;

    if (!knownInstances.includes(url.hostname)) return linkSharp;

    if (POST_PATH.test(url.pathname)) return albumsOutline;
    if (COMMENT_PATH.test(url.pathname)) return chatboxSharp;
    if (USER_PATH.test(url.pathname)) return personSharp;

    return linkSharp;
  }, [connectedInstance, link.url, knownInstances]);

  if (link.type === "image" || isUrlImage(link.url))
    return (
      <LinkImage src={getImageSrc(link.url, { size: 30 })} alt={link.text} />
    );

  if (link.type === "link") return <LinkIcon icon={icon} />;
}
