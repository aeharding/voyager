import { IonIcon, IonSkeletonText } from "@ionic/react";
import { styled } from "@linaria/react";
import { arrowUpSharp, chatbubbleOutline, repeat } from "ionicons/icons";
import { PostView } from "lemmy-js-client";

import { formatNumber } from "#/helpers/number";

import CrosspostContainer from "./CrosspostContainer";

const StyledCrosspostContainer = styled(CrosspostContainer)`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  max-width: 100%;

  border-radius: 0.5rem;
  overflow: hidden;

  color: inherit;
  text-decoration: none;
  -webkit-touch-callout: default;

  background: rgba(var(--ion-color-light-rgb), 0.5);
  padding: 3px 9px;

  font-size: 0.8em;

  color: var(--ion-color-text-aside);

  // Special class applied by CrosspostContainer when contents is read
  &.read {
    color: var(--read-color-medium);
  }
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const CrosspostIcon = styled(IonIcon)`
  font-size: 1.5rem;
`;

const CommunityTitle = styled.div`
  min-width: 20px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CommunityIonSkeletonText = styled(IonSkeletonText)`
  width: 90px;
`;

const StatIonSkeletonText = styled(IonSkeletonText)`
  width: 16px;
`;

interface CrosspostProps {
  post: PostView;
  url: string;
  className?: string;
}

export default function CompactCrosspost(props: CrosspostProps) {
  return (
    <StyledCrosspostContainer {...props}>
      {({ crosspost }) => (
        <>
          <CrosspostIcon icon={repeat} />
          {crosspost ? (
            <CommunityTitle>{crosspost.community.title}</CommunityTitle>
          ) : (
            <CommunityIonSkeletonText />
          )}
          <Stat>
            <IonIcon icon={arrowUpSharp} />{" "}
            {crosspost ? (
              formatNumber(crosspost.counts.score)
            ) : (
              <StatIonSkeletonText />
            )}
          </Stat>
          <Stat>
            <IonIcon icon={chatbubbleOutline} />{" "}
            {crosspost ? (
              formatNumber(crosspost.counts.comments)
            ) : (
              <StatIonSkeletonText />
            )}
          </Stat>
        </>
      )}
    </StyledCrosspostContainer>
  );
}
