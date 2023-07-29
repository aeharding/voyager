import styled from "@emotion/styled";
import { IonItem } from "@ionic/react";
import { CommunityView } from "lemmy-js-client";
import { maxWidthCss } from "../shared/AppContent";
import CommunityLink from "../labels/links/CommunityLink";
import Ago from "../labels/Ago";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { getHandle } from "../../helpers/lemmy";
import InlineMarkdown from "../shared/InlineMarkdown";

const Container = styled(IonItem)`
  ${maxWidthCss}
`;

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;

  width: 100%;
`;

const Stats = styled.div`
  font-size: 0.9rem;
  color: var(--ion-color-medium);
`;

const Description = styled.div`
  font-size: 0.875em;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

interface CommunitySummaryProps {
  community: CommunityView;
}

export default function CommunitySummary({ community }: CommunitySummaryProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <Container
      routerLink={buildGeneralBrowseLink(
        `/c/${getHandle(community.community)}`
      )}
    >
      <Contents>
        <div>
          <CommunityLink
            community={community.community}
            showInstanceWhenRemote
            subscribed={community.subscribed}
          />
        </div>
        <Stats>
          {community.counts.subscribers} Subscriber
          {community.counts.subscribers !== 1 ? "s" : ""} ·{" "}
          <Ago date={community.community.published} /> Old{" "}
        </Stats>
        {community.community.description && (
          <Description>
            <InlineMarkdown>{community.community.description}</InlineMarkdown>
          </Description>
        )}
      </Contents>
    </Container>
  );
}
