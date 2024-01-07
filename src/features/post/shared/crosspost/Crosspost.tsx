import styled from "@emotion/styled";
import { IonIcon, IonSkeletonText } from "@ionic/react";
import { arrowUpSharp, chatbubbleOutline, repeat } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import LargePostContents from "../../inFeed/large/LargePostContents";
import { formatNumber } from "../../../../helpers/number";
import { css } from "@emotion/react";
import CrosspostContainer from "./CrosspostContainer";

const StyledCrosspostContainer = styled(CrosspostContainer)`
  display: flex;
  flex-direction: column;
  gap: 8px;

  border-radius: 0.5rem;
  overflow: hidden;

  color: inherit;
  text-decoration: none;
  -webkit-touch-callout: default;

  background: rgba(var(--ion-color-light-rgb), 0.5);
  padding: 8px 12px;
`;

const Title = styled.div<{ isRead: boolean }>`
  font-size: 0.925em;

  ${({ isRead }) =>
    isRead &&
    css`
      color: var(--read-color);
    `}
`;

const Bottom = styled.div<{ isRead: boolean }>`
  display: flex;
  align-items: center;
  font-size: 0.8em;

  gap: 6px;

  color: var(--ion-color-text-aside);

  ${({ isRead }) =>
    isRead &&
    css`
      color: var(--read-color-medium);
    `}
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const CrosspostIcon = styled(IonIcon)`
  font-size: 1.5rem;
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

export default function Crosspost(props: CrosspostProps) {
  return (
    <StyledCrosspostContainer el="div" {...props}>
      {({ crosspost, hasBeenRead }) => (
        <>
          {crosspost ? (
            <Title isRead={hasBeenRead}>{crosspost.post.name}</Title>
          ) : (
            <IonSkeletonText />
          )}
          <LargePostContents post={crosspost ?? props.post} />
          <Bottom isRead={hasBeenRead}>
            <CrosspostIcon icon={repeat} />
            {crosspost ? (
              crosspost.community.title
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
          </Bottom>
        </>
      )}
    </StyledCrosspostContainer>
  );
}
