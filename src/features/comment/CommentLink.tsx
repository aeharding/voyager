import styled from "@emotion/styled";
import LinkInterceptor from "../shared/markdown/LinkInterceptor";
import { LinkData } from "./CommentLinks";
import { IonIcon } from "@ionic/react";
import { chevronForward, imageOutline, linkSharp } from "ionicons/icons";
import Url from "./Url";

const StyledLinkInterceptor = styled(LinkInterceptor)`
  text-decoration: none;
  color: inherit;
`;

const LinkIcon = styled(IonIcon)`
  font-size: 30px;
  opacity: 0.5;

  padding-right: 6px;
  margin-right: 2px;
  border-right: 1px solid rgba(160, 160, 160, 0.4);
`;

const Container = styled.div`
  display: flex;
  align-items: center;

  min-height: 50px;
  gap: 6px;
  padding: 4px 6px;

  border-radius: 8px;
  background: var(--ion-color-light);
  opacity: 0.8;
`;

const Content = styled.div`
  flex: 1;

  font-size: 0.875rem;

  display: flex;
  flex-direction: column;
  gap: 2px;

  min-width: 0;

  > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ChevronIcon = styled(IonIcon)`
  font-size: 1.2em;
  opacity: 0.5;
`;

interface CommentLinkProps {
  link: LinkData;
}

export default function CommentLink({ link }: CommentLinkProps) {
  return (
    <StyledLinkInterceptor href={link.url}>
      <Container onClick={(e) => e.stopPropagation()}>
        <LinkIcon icon={link.type === "image" ? imageOutline : linkSharp} />
        <Content>
          {link.text && link.text !== link.url ? <div>{link.text}</div> : ""}
          <div>
            <Url>{link.url}</Url>
          </div>
        </Content>
        <ChevronIcon icon={chevronForward} />
      </Container>
    </StyledLinkInterceptor>
  );
}
