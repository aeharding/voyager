import { styled } from "@linaria/react";
import { IonItem } from "@ionic/react";
import { CommunityView } from "lemmy-js-client";
import { maxWidthCss } from "../shared/AppContent";
import CommunityLink from "../labels/links/CommunityLink";
import Ago from "../labels/Ago";
import InlineMarkdown from "../shared/InlineMarkdown";
import { heart } from "ionicons/icons";
import { ActionButton } from "../post/actions/ActionButton";
import { ToggleIcon } from "./ToggleIcon";
import useCommunityActions from "./useCommunityActions";

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

const StyledCommunityLink = styled(CommunityLink)`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
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
  const { isSubscribed, subscribe, view } = useCommunityActions(
    community.community,
    community.subscribed,
  );

  return (
    <Container>
      <Contents>
        <Title>
          <StyledCommunityLink
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
              <ToggleIcon icon={heart} selected={isSubscribed} />
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
