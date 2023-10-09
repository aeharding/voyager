import styled from "@emotion/styled";
import { IonButton, IonIcon, IonItem } from "@ionic/react";
import { CommunityView } from "lemmy-js-client";
import { maxWidthCss } from "../shared/AppContent";
import CommunityLink from "../labels/links/CommunityLink";
import Ago from "../labels/Ago";
import { getHandle } from "../../helpers/lemmy";
import InlineMarkdown from "../shared/InlineMarkdown";
import { heart, heartDislike, heartOutline } from "ionicons/icons";
import useCommunityActions from "./useCommunityActions";
import { ActionButton } from "../post/actions/ActionButton";

const Container = styled(IonItem)`
  ${maxWidthCss}
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Title = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const HeartIcon = styled(IonIcon)`
  font-size: 24px;
  color: var(--ion-color-primary);
`;

interface CommunitySummaryProps {
  community: CommunityView;
}

export default function CommunitySummary({ community }: CommunitySummaryProps) {
  const handle = getHandle(community.community);
  const { isSubscribed, subscribe, view } = useCommunityActions(handle);

  return (
    <Container>
      <Contents>
        <Title>
          <CommunityLink
            community={community.community}
            showInstanceWhenRemote
            subscribed={community.subscribed}
          />
          <RightContainer>
            <ActionButton
              color={isSubscribed ? "danger" : "primary"}
              onClick={(e) => {
                subscribe();
                e.stopPropagation();
              }}
            >
              <HeartIcon icon={isSubscribed ? heart : heartOutline} />
            </ActionButton>
          </RightContainer>
        </Title>
        <Stats onClick={view}>
          {community.counts.subscribers} Subscriber
          {community.counts.subscribers !== 1 ? "s" : ""} ·{" "}
          <Ago date={community.community.published} /> Old{" "}
        </Stats>
        {community.community.description && (
          <Description onClick={view}>
            <InlineMarkdown>{community.community.description}</InlineMarkdown>
          </Description>
        )}
      </Contents>
    </Container>
  );
}
