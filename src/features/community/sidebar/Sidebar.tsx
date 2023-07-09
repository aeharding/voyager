import { CommunityResponse } from "lemmy-js-client";
import Markdown from "../../shared/Markdown";
import { IonBadge } from "@ionic/react";
import styled from "@emotion/styled";
import { formatNumber } from "../../../helpers/number";

const Container = styled.div`
  line-height: 1.5;
`;

interface SidebarProps {
  community: CommunityResponse;
}

export default function Sidebar({ community }: SidebarProps) {
  const description = community.community_view.community.description;

  return (
    <>
      <Container className="ion-padding">
        <IonBadge>
          {formatNumber(community.community_view.counts.subscribers)}{" "}
          subscribers
        </IonBadge>{" "}
        <IonBadge color="danger">
          {formatNumber(community.community_view.counts.posts)} posts
        </IonBadge>{" "}
        <IonBadge color="warning">
          {formatNumber(community.community_view.counts.comments)} comments
        </IonBadge>{" "}
        <IonBadge color="success">
          {formatNumber(community.community_view.counts.users_active_month)}{" "}
          users per month
        </IonBadge>{" "}
        <IonBadge color="tertiary">
          {formatNumber(community.community_view.counts.users_active_week)} per
          week
        </IonBadge>{" "}
        <IonBadge color="light">
          {formatNumber(community.community_view.counts.users_active_day)} per
          day
        </IonBadge>
        {description ? (
          <Markdown>{description}</Markdown>
        ) : (
          <p>
            <em>No community description available</em>
          </p>
        )}
      </Container>
    </>
  );
}
